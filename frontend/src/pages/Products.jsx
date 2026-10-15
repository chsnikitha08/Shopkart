import { useEffect, useState } from "react";
import { productApi, wishlistApi } from "../services/api";
import ProductCard from "../components/ProductCard";
import SearchBar from "../components/SearchBar";
import { EmptyState, ErrorState, Loading } from "../components/States";

const CATEGORIES = ["All Categories", "Electronics", "Fashion", "Books", "Home"];

export default function Products() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [sort, setSort] = useState("");
  const [products, setProducts] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    wishlistApi
      .list()
      .then((res) => setSavedIds(new Set(res.data.wishlist.map((p) => p._id))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(false);

    const params = {};
    if (debouncedSearch) params.search = debouncedSearch;
    if (category !== "All Categories") params.category = category;
    if (sort) params.sort = sort;

    productApi
      .list(params)
      .then((res) => !ignore && setProducts(res.data.products))
      .catch(() => !ignore && setError(true))
      .finally(() => !ignore && setLoading(false));

    return () => {
      ignore = true;
    };
  }, [debouncedSearch, category, sort, reloadKey]);

  return (
    <section>
      <div className="page-head">
        <h1>Products</h1>
      </div>

      <div className="toolbar">
        <SearchBar value={search} onChange={setSearch} />
        <select
          className="input"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Category"
        >
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          className="input"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort by"
        >
          <option value="">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      {loading ? (
        <Loading text="Loading products..." />
      ) : error ? (
        <ErrorState
          title="Something went wrong while loading products."
          onRetry={() => setReloadKey((k) => k + 1)}
        />
      ) : products.length === 0 ? (
        <EmptyState icon="🔍" title="No products found." text="Try a different search or category." />
      ) : (
        <div className="grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} initiallySaved={savedIds.has(p._id)} />
          ))}
        </div>
      )}
    </section>
  );
}

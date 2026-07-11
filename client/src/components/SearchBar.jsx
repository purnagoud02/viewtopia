import { memo, useEffect, useState } from "react";

function SearchBar({ search, setSearch }) {
  const [value, setValue] = useState(search);

  useEffect(() => {
    const handler = window.setTimeout(() => setSearch(value), 250);
    return () => window.clearTimeout(handler);
  }, [value, setSearch]);

  useEffect(() => {
    if (search !== value) {
      const next = search ?? "";
      const handler = window.setTimeout(() => setValue(next), 0);
      return () => window.clearTimeout(handler);
    }
  }, [search, value]);

  return (
    <div className="search-container">
      <input
        className="search-box"
        type="text"
        placeholder="🔍 Search movies by title or genre..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

export default memo(SearchBar);
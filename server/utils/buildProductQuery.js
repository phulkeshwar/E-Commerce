export const buildProductQuery = (products, query = {}) => {
  const search = (query.search || "").trim().toLowerCase();
  const category = query.category || "All";
  const featured = query.featured === "true";
  const badge = (query.badge || "").trim().toLowerCase();

  return products.filter((product) => {
    const tags = product.tags || [];
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(search) ||
      product.description.toLowerCase().includes(search) ||
      tags.some((tag) => tag.toLowerCase().includes(search));

    const matchesCategory = category === "All" || product.category === category;
    const matchesFeatured = !featured || product.isFeatured;
    const matchesBadge = !badge || String(product.badge || "").toLowerCase() === badge;

    return matchesSearch && matchesCategory && matchesFeatured && matchesBadge;
  });
};

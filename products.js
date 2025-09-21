// products.js
fetch("products.json")
  .then(response => response.json())
  .then(data => {
    window.PRODUCTS = data;
    // Dispatch custom event so products.html knows products are ready
    document.dispatchEvent(new Event("productsLoaded"));
  })
  .catch(err => {
    console.error("Failed to load products.json", err);
    window.PRODUCTS = [];
  });

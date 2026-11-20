const API = "/api/products";

const form = document.getElementById("product-form");
const nameInput = document.getElementById("name");
const priceInput = document.getElementById("price");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const formTitle = document.getElementById("form-title");
const tbody = document.getElementById("product-body");
const messageBox = document.getElementById("message");

let editingId = null;
let messageTimer = null;

function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = "message " + type;
  clearTimeout(messageTimer);
  messageTimer = setTimeout(() => messageBox.classList.add("hidden"), 3000);
}

function resetForm() {
  editingId = null;
  form.reset();
  formTitle.textContent = "Add New Product";
  submitBtn.textContent = "Submit";
  cancelBtn.classList.add("hidden");
}

// READ
async function loadProducts() {
  try {
    const res = await fetch(API);
    const products = await res.json();
    renderProducts(products);
  } catch (err) {
    showMessage("Could not load products. Is the server running?", "error");
  }
}

function renderProducts(products) {
  tbody.innerHTML = "";

  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="empty">No products found. Add one above!</td></tr>';
    return;
  }

  products.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + p.id + "</td>" +
      "<td>" + escapeHtml(p.name) + "</td>" +
      "<td>" + p.price + "</td>" +
      "<td>" +
      '<button class="btn btn-edit">Edit</button>' +
      '<button class="btn btn-delete">Delete</button>' +
      "</td>";

    tr.querySelector(".btn-edit").addEventListener("click", () => startEdit(p));
    tr.querySelector(".btn-delete").addEventListener("click", () => deleteProduct(p.id));
    tbody.appendChild(tr);
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// CREATE / UPDATE
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = { name: nameInput.value, price: priceInput.value };

  try {
    const res = await fetch(editingId ? API + "/" + editingId : API, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || "Something went wrong.", "error");
      return;
    }

    showMessage(editingId ? "Product updated successfully!" : "Product created successfully!", "success");
    resetForm();
    loadProducts();
  } catch (err) {
    showMessage("Server error. Please try again.", "error");
  }
});

function startEdit(product) {
  editingId = product.id;
  nameInput.value = product.name;
  priceInput.value = product.price;
  formTitle.textContent = "Edit Product (ID " + product.id + ")";
  submitBtn.textContent = "Update";
  cancelBtn.classList.remove("hidden");
  nameInput.focus();
}

cancelBtn.addEventListener("click", resetForm);

// DELETE
async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;

  try {
    const res = await fetch(API + "/" + id, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || "Could not delete.", "error");
      return;
    }

    if (editingId === id) resetForm();
    showMessage("Product deleted successfully!", "success");
    loadProducts();
  } catch (err) {
    showMessage("Server error. Please try again.", "error");
  }
}

loadProducts();
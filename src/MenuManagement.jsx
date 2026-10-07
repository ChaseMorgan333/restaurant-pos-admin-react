import { useEffect, useState } from "react";

export function MenuManagement({ apiBaseUrl }) {
  const [editingItem, setEditingItem] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);

  const [categoryName, setCategoryName] = useState("");

  const [itemName, setItemName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [image, setImage] = useState(null);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadMenu();
  }, [apiBaseUrl]);

  async function loadMenu() {
  setErrorMessage("");

  try {
    const categoryResponse = await fetch(
      `${apiBaseUrl}/api/menu/categories`
    );

    if (!categoryResponse.ok) {
      throw new Error(
        `Categories failed: ${categoryResponse.status}`
      );
    }

    const categoryData = await categoryResponse.json();
    setCategories(categoryData);

    setCategoryId((currentCategoryId) => {
      if (currentCategoryId === "" && categoryData.length > 0) {
        return String(categoryData[0].id);
      }

      return currentCategoryId;
    });
  } catch (error) {
    console.error("Could not load categories:", error);
    setErrorMessage("Could not load menu categories.");
  }

  try {
    const itemResponse = await fetch(
      `${apiBaseUrl}/api/menu/items`
    );

    if (!itemResponse.ok) {
      throw new Error(`Items failed: ${itemResponse.status}`);
    }

    const itemData = await itemResponse.json();
    setItems(itemData);
  } catch (error) {
    console.error("Could not load menu items:", error);
    setErrorMessage((currentMessage) =>
      currentMessage
        ? `${currentMessage} Could not load menu items.`
        : "Could not load menu items."
    );
  }
}

  async function handleAddCategory(event) {
    event.preventDefault();

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/menu/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            name: categoryName.trim(),
            active: true,
            sortOrder: categories.length + 1
          })
        }
      );

      if (!response.ok) {
        throw new Error("Could not create category");
      }

      setCategoryName("");
      await loadMenu();
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not add the category.");
    }
  }

  async function handleAddItem(event) {
    event.preventDefault();

    const formData = new FormData();

    formData.append("name", itemName.trim());
    formData.append("price", price);
    formData.append("categoryId", categoryId);

    if (image !== null) {
      formData.append("image", image);
    }

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/menu/items`,
        {
          method: "POST",
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error("Could not create menu item");
      }

      setItemName("");
      setPrice("");
      setImage(null);

      // Clears the selected filename shown by the input.
      document.getElementById("menuItemImage").value = "";

      await loadMenu();
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not add the menu item.");
    }
  }

  async function deleteCategory(categoryId) {
    const confirmed = window.confirm(
        "Are you sure you want to delete this category?"
    );

    if (!confirmed) return;

    const response = await fetch(
        `http://localhost:8080/api/menu/categories/${categoryId}`,
        {
            method: "DELETE"
        }
    );

    if (!response.ok) {
        throw new Error("Unable to delete category");
    }

    await loadMenu();

    setCategories(currentCategories =>
        currentCategories.filter(category => category.id !== categoryId)
    );
}

  function getCategoryName(itemCategoryId) {
    const category = categories.find(
      (category) => category.id === itemCategoryId
    );

    return category ? category.name : "Unknown";
  }

  function getImageSource(item) {
    if (!item.imageData) {
      return null;
    }

    return `data:${
      item.imageContentType || "image/jpeg"
    };base64,${item.imageData}`;
  }
   function beginEditing(item) {
  console.log("Editing item:", item);
  setEditingItem({ ...item });
  setEditImage(null);
}

  return (
    <>
      <section className="card">
        <h2>Add Menu Category</h2>

        <form onSubmit={handleAddCategory} className="form">
          <input
            type="text"
            placeholder="Category name"
            value={categoryName}
            onChange={(event) =>
              setCategoryName(event.target.value)
            }
            required
          />

          <button type="submit">Add Category</button>
        </form>
      </section>

      <section className="card">
        <h2>Add Menu Item</h2>

        {categories.length === 0 ? (
          <p>Add a category before adding menu items.</p>
        ) : (
          <form onSubmit={handleAddItem} className="form">
            <input
              type="text"
              placeholder="Item name"
              value={itemName}
              onChange={(event) =>
                setItemName(event.target.value)
              }
              required
            />

            <input
              type="number"
              placeholder="Price"
              value={price}
              min="0"
              step="0.01"
              onChange={(event) =>
                setPrice(event.target.value)
              }
              required
            />

            <select
              value={categoryId}
              onChange={(event) =>
                setCategoryId(event.target.value)
              }
              required
            >
              {categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              ))}
            </select>

            <input
              id="menuItemImage"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(event) =>
                setImage(event.target.files[0] || null)
              }
            />

            <button type="submit">Add Menu Item</button>
          </form>
        )}

        {errorMessage && (
          <p className="error">{errorMessage}</p>
        )}
      </section>

      <section className="card">
        <h2>Menu Categories</h2>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Active</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>{category.active ? "Yes" : "No"}</td>
                <td>{category.sortOrder}</td>
                <td>
                  <button
                  type = "button"
                  onClick={() => deleteCategory(category.id)}
                >
                  Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>Menu Items</h2>

<div className = "table-container">
        <table>
          <thead>
            <tr>
              <th>Picture</th>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
  {items.map((item) => {
    const imageSource = getImageSource(item);
    const isEditing = editingItem?.id === item.id;

   
    return (
      <tr key={item.id}>
        <td>
          {imageSource ? (
            <img
              src={imageSource}
              alt={item.name}
              width="80"
              height="60"
              style={{ objectFit: "cover" }}
            />
          ) : (
            "No picture"
          )}
        </td>

        <td>{item.id}</td>
        <td>
  {isEditing ? (
    <input
      style = {{ width: "120px"}}
      value={editingItem.name}
      onChange={(event) =>
        setEditingItem({
          ...editingItem,
          name: event.target.value
        })
      }
    />
  ) : (
    item.name
  )}
</td>
        <td>
  {isEditing ? (
    <select
      value={editingItem.categoryId}
      onChange={(event) =>
        setEditingItem({
          ...editingItem,
          categoryId: Number(event.target.value)
        })
      }
    >
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.name}
        </option>
      ))}
    </select>
  ) : (
    getCategoryName(item.categoryId)
  )}
</td>

        <td>{/* This is the table cell for item price */}
          {isEditing ? (
            <input
            style={{width: "75px"}}
              type="number"
              step="0.01"
              value={editingItem.price}
              onChange={(event) => 
                setEditingItem({
                ...editingItem,
                price : event.target.value
              })
            }
            />
          ) : (
            `$${Number(item.price).toFixed(2)}`
          )}
        </td>
        {/* This is the table cell for item availability */}
        <td>{isEditing ? (
          <input
            type = "checkbox"
            checked = {editingItem.available}
            onChange={(event) =>
              setEditingItem({
                ...editingItem,
                available: event.target.checked
              })
            }
            />
          ) : (
            item.available ? "Yes" : "No"
        )}</td>

        <td>
          {isEditing ? (
            <>
              <button type="button">
                Save
              </button>

              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setEditImage(null);
                }}
              >
                Cancel
              </button>
            </>
          ) : (
            /* This is the button for edit */
            // <button
            //   type="button"
            //   onClick={() => {
            //     setEditingItem({...item});
            //     setEditImage(null);
            //   }}
            // >
            <button
            type="button"
            onClick={()=> beginEditing(item)}
            >
              Edit
            </button>
          )}
        </td>
      </tr>
    );
  })}
</tbody>
        </table>
        </div>
      </section>
    </>
  );
}

export default MenuManagement;
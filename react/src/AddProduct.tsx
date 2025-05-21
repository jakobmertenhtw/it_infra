import React from "react";
import "./App.css";

const AddProduct: React.FC = () => {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [price, setPrice] = React.useState(0);
  const [image, setImage] = React.useState<File | null>(null);

  async function submitForm() {
    // first upload image

    if (!name || !description || !price) {
      alert("Please fill all fields");
      return;
    }

    if (image) {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price.toString());

      console.log("Form data to be sent:", formData);

      await fetch(
        "https://idggvb8375.execute-api.eu-west-1.amazonaws.com/v1/upload",
        {
          method: "POST",
          body: formData,
        }
      )
        .then(async (response) => {
          if (response.ok) {
            console.log(await response.json());
            alert("Image uploaded successfully");
          } else {
            alert("Error uploading image");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Error uploading image");
        });
    }

  }

  return (
    <div>
      <h1>Add Product</h1>
      <form>
        <div className="form-group">
          <label>Product Image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setImage(file);
                const reader = new FileReader();
                reader.onload = function (ev) {
                  const img = document.getElementById(
                    "preview-img"
                  ) as HTMLImageElement;
                  if (img && ev.target?.result) {
                    img.src = ev.target.result as string;
                    img.style.display = "block";
                  }
                };
                reader.readAsDataURL(file);
              } else {
                setImage(null);
                const img = document.getElementById(
                  "preview-img"
                ) as HTMLImageElement;
                if (img) {
                  img.src = "";
                  img.style.display = "none";
                }
              }
            }}
          />
          <div>
            <img
              id="preview-img"
              alt="Preview"
              style={{ maxWidth: "200px", marginTop: "10px", display: "none" }}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Product Name:</label>
          <input
            type="text"
            name="productName"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            required
            rows={5}
            cols={40}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Price:</label>
          <input
            type="number"
            name="price"
            min="0"
            step="0.01"
            required
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            submitForm();
          }}
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;

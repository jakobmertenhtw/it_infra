import React, { use, useEffect } from "react";
import "./App.css";
import { ProductCard } from "./ProductCard";

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
};

type Label = {
  name: string;
};

const AddProduct: React.FC = () => {
  const [products, setProducts] = React.useState<Product[]>([]);
  const [labels, setLabels] = React.useState<Label[]>([]);
  const [selectedLabels, setSelectedLabels] = React.useState<Label[]>([]);

  function handleLabelClick(label: Label) {
    // first check if the label is already selected
    const isSelected = selectedLabels.some((selectedLabel) => {
      return selectedLabel.name === label.name;
    });
    if (isSelected) {
      // if it is selected, remove it from the selected labels
      setSelectedLabels((prev) =>
        prev.filter((selectedLabel) => selectedLabel.name !== label.name)
      );
    } else {
      // if it is not selected, add it to the selected labels
      setSelectedLabels((prev) => [...prev, label]);
    }
  }

  async function fetchProducts() {

    console.log("Selected labels:", selectedLabels);

    let url = "https://7kat3yi6ui.execute-api.eu-west-1.amazonaws.com/products";

    if (selectedLabels.length > 0) {
      const selectedLabelNames = selectedLabels.map((label) => label.name);
      url += `?labels=${selectedLabelNames.join(",")}`;
    }

    await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        mode: "cors",
      },
    })
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          console.log("Products fetched successfully:", data);
        } else {
          alert("Error fetching products");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error fetching products");
      });
  }

  async function fetchLabels() {
    await fetch(
      "https://7kat3yi6ui.execute-api.eu-west-1.amazonaws.com/labels",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          mode: "cors",
        },
      }
    )
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          setLabels(data);
          console.log("Labels fetched successfully:", data);
        } else {
          alert("Error fetching labels");
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Error fetching labels");
      });
  }

  useEffect(() => {
    fetchProducts();
    fetchLabels();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedLabels]);

  return (
    <div>
      <h1>View Products</h1>

      <div className="labels-container">
        {labels.map((label) => {
          const isSelected = selectedLabels.some(
            (selectedLabel) => selectedLabel.name === label.name
          );
          return (
            <div
              className={`label${isSelected ? " selected" : ""}`}
              onClick={() => handleLabelClick(label)}
            >
              {label.name}
            </div>
          );
        })}
      </div>

      <div className="products-container">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default AddProduct;

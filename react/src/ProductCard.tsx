import React from "react";
import "./App.css";
import { Product } from "./ViewProducts";

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const imageUrl = `https://jakob-team-product-images.s3.eu-west-1.amazonaws.com/${product.id}`;
  const audioUrl = `https://jakob-team-audio-files.s3.eu-west-1.amazonaws.com/${product.id}.mp3`;
  const [imageExists, setImageExists] = React.useState(false);
  const [audioExists, setAudioExists] = React.useState(false);

  const handleImageLoad = () => {
    setImageExists(true);
  };

  const handleImageError = () => {
    setImageExists(false);
  };

  const audio = new window.Audio();
  audio.src = audioUrl;
  audio.oncanplaythrough = () => setAudioExists(true);
  audio.onerror = () => setAudioExists(false);

  return (
    <div className="product">
      <img
        src={imageUrl}
        alt={product.name}
        onLoad={handleImageLoad}
        onError={handleImageError}
        style={{ display: "none" }}
      />

      {imageExists && (
        <img src={imageUrl} alt={product.name} className="product-image" />
      )}
      <h3>{product.name}</h3>
      <p className="product-description">{product.description}</p>
      <p className="product-price">{product.price}</p>
      <link
        rel="preload"
        as="audio"
        href={audioUrl}
        onLoad={() => setAudioExists(true)}
        onError={() => setAudioExists(false)}
        style={{ display: "none" }}
      />
      {typeof window !== "undefined" &&
        (() => {

          return audioExists ? (
            <audio controls>
              <source src={audioUrl} type="audio/mp3" />
            </audio>
          ) : null;
        })()}
    </div>
  );
};

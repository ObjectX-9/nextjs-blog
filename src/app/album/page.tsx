"use client";

import PhotoAlbum from "react-photo-album";
import "react-photo-album/styles.css";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// import optional lightbox plugins
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { photos } from "./photos";
import { useState } from "react";

export default function Album() {
  const [index, setIndex] = useState(-1);

  return (
    <main className="flex h-screen w-full box-border flex-col overflow-y-auto py-8 px-8">
      <h1 className="text-3xl font-bold mb-8">Adventure Photo Album</h1>
      <div className="photo-album-container w-full max-w-[2000px] mx-auto">
        <PhotoAlbum
          layout="masonry"
          photos={photos}
          spacing={10}
          columns={4}
          onClick={({ index }) => setIndex(index)}
        />

        <Lightbox
          slides={photos.map((photo) => ({ src: photo.src }))}
          open={index >= 0}
          index={index}
          close={() => setIndex(-1)}
          plugins={[Fullscreen, Slideshow, Thumbnails, Zoom]}
        />
      </div>
    </main>
  );
}

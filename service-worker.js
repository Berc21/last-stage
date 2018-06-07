importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.2.0/workbox-sw.js');
importScripts("js/idb.js");
importScripts("js/dbpromise.js");


if (workbox) {

  // Cache static
  workbox.routing.registerRoute(
    /\.(?:js|css|json)$/,
    workbox.strategies.staleWhileRevalidate({
      cacheName: 'static'
    })
  );

  // Cache single restaurant page that are visited
  workbox.routing.registerRoute(
    new RegExp('restaurant.html(.*)'),
    workbox.strategies.networkFirst({
      cacheName: 'restaurant-pages'
    })
  );


  // Precache html files
  workbox.precaching.precacheAndRoute([
    'index.html',
    'restaurant.html'
  ]);

  // Cache requested images
  workbox.routing.registerRoute(
    /\.(?:png|gif|jpg|jpeg|svg|webp)$/,
    workbox.strategies.cacheFirst({
      cacheName: 'img',
      plugins: [
        new workbox.expiration.Plugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
        })
      ]
    })
  );
}

self.addEventListener("sync", function (event) {
  switch (event.tag) {
    case "posts":
      event.waitUntil(
        readAllData("posts").then(function (data) {
          for (var dt of data) {
            fetch("http://localhost:1337/reviews/", {
                method: "POST",
                body: JSON.stringify({
                  restaurant_id: dt.restaurant_id,
                  name: dt.name,
                  rating: dt.rating,
                  comments: dt.comments,
                  date: dt.date
                })
              })
              .then(function (res) {
                if (res) {
                  res.json().then(function (resData) {
                    deleteItemFromData("posts", resData.date);
                  });
                }
              })
              .catch(function (err) {
                console.log("Error while sending data", err);
              });
          }
        })
      );
    case "fav":
      event.waitUntil(
        readAllData('favorite').then(data => {
          for (let item of data) {
            const id = item.id;
            const fav = item.is_favorite;
            console.log(id, fav)
            fetch(
              `http://localhost:1337/restaurants/${id}/?is_favorite=${fav}`, {
                method: "PUT"
              }
            ).then(res => console.log(res, "from fech resposnse"))
          }
        })
      );
      break;
  }
});
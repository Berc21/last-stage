importScripts("js/idb.js");
importScripts("js/dbpromise.js");
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.0.0/workbox-sw.js');

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
		  cacheName: 'restaurant-single-pages'
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
  
  self.addEventListener("sync", function (event) {
    if (event.tag === "sync-new-posts") {
      event.waitUntil(
        readAllData("sync-posts").then(function (data) {
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
                if (res.ok) {
                  res.json().then(function (resData) {
                    deleteItemFromData("sync-posts", resData.date);
                  });
                }
              })
              .catch(function (err) {
                console.log("Error while sending data", err);
              });
          }
        })
      );
    }
    if (event.tag === "sync-favorites") {
      event.waitUntil(
        readAllData("favorite-rests").then(function (data) {
          for (var dt of data) {
            const id = dt.id;
            if (dt.favOrNot) {
              fetch(
                  `http://localhost:1337/restaurants/${id}/?is_favorite=true`, {
                    method: "PUT",
                    body: JSON.stringify({
                      date: dt.date
                    })
                  }
                )
                .then(function (res) {
                  if (res.ok) {
                    res.json().then(function (resData) {
                      deleteItemFromData("favorite-rests", resData.date);
                    });
                  }
                })
                .catch(function (err) {
                  console.log("Error while sending data", err);
                });
            } else {
              fetch(
                  `http://localhost:1337/restaurants/${id}/?is_favorite=false`, {
                    method: "PUT",
                    body: JSON.stringify({
                      date: dt.date
                    })
                  }
                )
                .then(function (res) {
                  if (res.ok) {
                    res.json().then(function (resData) {
                      deleteItemFromData("favorite-rests", resData.date);
                    });
                  }
                })
                .catch(function (err) {
                  console.log("Error while sending data", err);
                });
            }
          }
        })
      );
    }
  });
}
  

  

let restaurant, map;

function loadContentNetworkFirst() {
    getRestaurantReviews().then(e => {
        fillReviewsHTML(e), saveReviewsDataLocally(e)
    }).catch(e => {
        console.log("Network requests have failed, this is expected if offline"), getReviewsData().then(e => {
            e.length ? fillReviewsHTML(e) : console.log("no data")
        })
    })
}

function saveReviewsDataLocally(e) {
    return "indexedDB" in window ? dbPromise.then(t => {
        const n = t.transaction("reviews", "readwrite"),
            a = n.objectStore("reviews");
        return Promise.all(e.map(e => a.put(e))).catch(() => {
            throw n.abort(), Error("reviews were not added to the store")
        })
    }) : null
}

function getReviewsData() {
    return "indexedDB" in window ? dbPromise.then(e => {
        return e.transaction("reviews", "readonly").objectStore("reviews").getAll()
    }) : null
}
window.initMap = ((e = self.restaurant) => {
    self.map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16,
        center: e.latlng,
        scrollwheel: !1
    }), self.map.addListener("tilesloaded", setMapTitle), DBHelper.mapMarkerForRestaurant(self.restaurant, self.map)
}), document.addEventListener("DOMContentLoaded", e => {
    fetchRestaurantFromURL((e, t) => {
        e ? console.error(e) : fillBreadcrumb()
    })
}), setMapTitle = (() => {
    document.getElementById("map").querySelector("iframe").setAttribute("title", "Google maps with restaurant location");
    const e = document.getElementById("map").querySelector("iframe").contentWindow.document.querySelector("html");
    console.log(e), e.setAttribute("lang", "en")
}), fetchRestaurantFromURL = (e => {
    if (self.restaurant) return void e(null, self.restaurant);
    const t = getParameterByName("id");
    t ? DBHelper.fetchRestaurantById(t, (t, n) => {
        self.restaurant = n, n ? (fillRestaurantHTML(), e(null, n)) : console.error(t)
    }) : (error = "No restaurant id in URL", e(error, null))
}), getReviewsURL = function() {
    const e = window.location.href.indexOf("=");
    return `http://localhost:1337/reviews/?restaurant_id=${window.location.href.slice(e+1)}`
}, fillRestaurantHTML = ((e = self.restaurant) => {
    document.getElementById("restaurant-name").innerHTML = e.name, document.getElementById("restaurant-address").innerHTML = e.address;
    const t = document.getElementById("restaurant-img");
    t.className = "restaurant-img", t.alt = `${e.name} restaurant`;
    const n = DBHelper.imageUrlForRestaurant(e),
        a = `img/${n}-1x.jpg 1x, img/${n}-1x.webp 1x , img/${n}-2x.jpg 2x, img/${n}-2x.webp 2x`;
    if (t.setAttribute("srcset", a), t.setAttribute("sizes", "(min-width: 416px) 320px"), t.src = `img/${n}-2x.jpg`, document.getElementById("restaurant-cuisine").innerHTML = e.cuisine_type, e.is_favorite) {
        const e = document.querySelector(".favorite_btn");
        e.classList.remove("non-favorite"), e.innerHTML = "Unfav", document.querySelector(".heart").style.color = "#ad034d"
    } else {
        const e = document.querySelector(".favorite_btn");
        e.innerHTML = "Fav", e.classList.add("non-favorite"), document.querySelector(".heart").style.color = "#464444c7"
    }
    e.operating_hours && fillRestaurantHoursHTML(), getReviewsURL()
}), fillRestaurantHoursHTML = ((e = self.restaurant.operating_hours) => {
    const t = document.getElementById("restaurant-hours");
    for (let n in e) {
        const a = document.createElement("tr"),
            o = document.createElement("td");
        o.innerHTML = n, a.appendChild(o);
        const r = document.createElement("td");
        r.innerHTML = e[n], a.appendChild(r), t.appendChild(a)
    }
}), getRestaurantReviews = (() => fetch(getReviewsURL()).then(e => {
    if (!e.ok) throw Error(e.statusText);
    return e.json()
})), loadContentNetworkFirst(), getRestaurantReviews = (() => fetch(getReviewsURL()).then(e => {
    if (!e.ok) throw Error(e.statusText);
    return e.json()
})), fillReviewsHTML = (e => {
    const t = document.getElementById("reviews-container"),
        n = document.createElement("h3");
    if (n.innerHTML = "REVIEWS", n.classList = "review-list_title", t.appendChild(n), !e) {
        const e = document.createElement("p");
        return e.innerHTML = "No reviews yet!", void t.appendChild(e)
    }
    const a = document.getElementById("reviews-list");
    e.forEach(e => {
        a.appendChild(createReviewHTML(e))
    }), t.appendChild(a)
}), createReviewHTML = (e => {
    const t = document.createElement("li"),
        n = document.createElement("p");
    n.innerHTML = e.name, n.classList = "reviewer", t.appendChild(n);
    const a = document.createElement("p");
    let o = new Date(e.createdAt);
    a.innerHTML = o.toLocaleDateString(), t.appendChild(a);
    const r = document.createElement("p");
    r.innerHTML = `Rating: ${e.rating}`, r.className = "ratings", t.appendChild(r);
    const i = document.createElement("p");
    return i.innerHTML = e.comments, t.appendChild(i), t
}), fillBreadcrumb = ((e = self.restaurant) => {
    const t = document.getElementById("breadcrumb"),
        n = document.createElement("li");
    n.innerHTML = e.name, t.appendChild(n)
}), getParameterByName = ((e, t) => {
    t || (t = window.location.href), e = e.replace(/[\[\]]/g, "\\$&");
    const n = new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(t);
    return n ? n[2] ? decodeURIComponent(n[2].replace(/\+/g, " ")) : "" : null
});
const restaurantId = window.location.href.slice(41);
document.getElementById("restId").value = restaurantId;
var buttonMap = document.getElementById("showmap");
buttonMap.addEventListener("click", loadScript, !1), document.querySelector("#post-message").addEventListener("submit", function(e) {
    e.preventDefault();
    const t = document.querySelector('input[name="rating"]:checked'),
        n = document.getElementById("reviewer-name"),
        a = document.getElementById("comment");
    if (!("serviceWorker" in navigator && "SyncManager" in window)) {
        console.log("event 2");
        var o = {
            restaurant_id: restaurantId,
            name: n.value,
            rating: t.value,
            comments: a.value
        };
        return fetch("http://localhost:1337/reviews/", {
            method: "POST",
            headers: new Headers({
                "content-type": "application/json"
            }),
            body: JSON.stringify(o)
        }).then(function(e) {
            e.ok && window.location.reload()
        })
    }
    navigator.serviceWorker.ready.then(function(e) {
        var o = {
            date: (new Date).toISOString(),
            restaurant_id: restaurantId,
            name: n.value,
            rating: t.value,
            comments: a.value
        };
        writeData("sync-posts", o).then(function() {
            return e.sync.register("sync-new-posts")
        }).then(function(e) {
            console.log("you're post was saved for sync!"), navigator.onLine ? window.location.reload() : document.getElementById("connectivity-message").style.display = "block"
        }).catch(function(e) {
            console.log(e)
        }), console.log("registered")
    }).catch(function() {
        console.log("event 1");
        var e = {
            restaurant_id: restaurantId,
            name: n.value,
            rating: t.value,
            comments: a.value
        };
        fetch("http://localhost:1337/reviews/", {
            method: "POST",
            headers: new Headers({
                "content-type": "application/json"
            }),
            body: JSON.stringify(e)
        }).then(function(e) {
            e.ok && window.location.reload()
        })
    })
});
var offlineNotification = document.getElementById("offline");

function showIndicator() {
    offlineNotification.innerHTML = "You are currently offline.", offlineNotification.className = "showOfflineNotification"
}

function hideIndicator() {
    offlineNotification.className = "hideOfflineNotification", document.getElementById("connectivity-message").style.display = "none"
}

function favoriteRest(e) {
    console.log(e.target), console.log("hey");
    var t = e.target;
    if (console.log(t.classList.contains("non-favorite")), t.classList.contains("non-favorite")) {
        console.log("here!"), t.innerHTML = "Unfav", t.classList.remove("non-favorite");
        const e = 1337,
            n = window.location.href.indexOf("="),
            a = window.location.href.slice(n + 1);
        fetch(`http://localhost:${e}/restaurants/${a}/?is_favorite=true`, {
            method: "put"
        }), document.getElementsByClassName("heart")[0].style.color = "#ad034d"
    } else {
        console.log("there!"), t.innerHTML = "Fav", t.classList.add("non-favorite");
        const e = 1337,
            n = window.location.href.indexOf("="),
            a = window.location.href.slice(n + 1);
        fetch(`http://localhost:${e}/restaurants/${a}/?is_favorite=false`, {
            method: "put"
        }), document.getElementsByClassName("heart")[0].style.color = "rgba(70, 68, 68, 0.781)"
    }
}

function loadScript() {
    let e = document.createElement("script");
    return e.type = "text/javascript", 
    e.src = "https://maps.googleapis.com/maps/api/js?libraries=places&callback=initMap", 
    document.getElementsByTagName("head")[0].appendChild(e), displayMap(), 
    buttonMap.style.display = "none";
}

function displayMap() {
    document.getElementById("map-container").style.display = "block"
}
window.addEventListener("online", hideIndicator), window.addEventListener("offline", showIndicator), document.querySelector(".favorite_btn").addEventListener("click", function(e) {
    if ("serviceWorker" in navigator && "SyncManager" in window) {
        let e;
        this.classList.contains("non-favorite") ? (e = !0, this.innerHTML = "Unfav", this.classList.remove("non-favorite"), document.getElementsByClassName("heart")[0].style.color = "#ad034d") : (e = !1, this.innerHTML = "Fav", this.classList.add("non-favorite"), document.getElementsByClassName("heart")[0].style.color = "rgba(70, 68, 68, 0.781)"), navigator.serviceWorker.ready.then(function(t) {
            var n = {
                date: (new Date).toISOString(),
                favOrNot: e,
                id: restaurantId
            };
            writeData("favorite-rests", n).then(function() {
                return t.sync.register("sync-favorites")
            }).catch(function(e) {
                console.log(e)
            })
        })
    } else favoriteRest(e)
});
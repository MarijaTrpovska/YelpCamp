/* https://docs.mapbox.com/mapbox-gl-js/guides/install/ */

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/light-v11', //'mapbox://styles/mapbox/streets-v12', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10, // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());


/* https://docs.mapbox.com/mapbox-gl-js/example/add-a-marker/ */
/* const marker1 = new mapboxgl.Marker()
.setLngLat([12.554729, 55.70651])
.addTo(map);const marker1 = new mapboxgl.Marker()
.setLngLat([12.554729, 55.70651])
.addTo(map); */

new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(                 //https://docs.mapbox.com/mapbox-gl-js/api/markers/   scroll down to popup section and see example
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h3>${campground.title}</h3><p>${campground.location}</p>`
        )
    )
    .addTo(map)
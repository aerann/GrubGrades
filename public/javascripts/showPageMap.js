mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v12', // style URL
    center: dish.geometry.coordinates, // starting position [lng, lat]
    zoom: 9, // starting zoom
});
 
new mapboxgl.Marker()
    .setLngLat(dish.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h3>${dish.title}</h3><p>${dish.location}</p>`
        )
    )
    .addTo(map)
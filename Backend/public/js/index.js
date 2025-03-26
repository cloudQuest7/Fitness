Shery.imageEffect("#back", {
    style: 5,  // or whichever style number you're using
    config: {"a":{"value":2,"range":[0,30]},"b":{"value":-0.95,"range":[-1,1]},"zindex":{"value":-9996999,"range":[-9999999,9999999]},"aspect":{"value":2.165336365372294},"ignoreShapeAspect":{"value":true},"shapePosition":{"value":{"x":0,"y":0}},"shapeScale":{"value":{"x":0.5,"y":0.5}},"shapeEdgeSoftness":{"value":0,"range":[0,0.5]},"shapeRadius":{"value":0,"range":[0,2]},"currentScroll":{"value":0},"scrollLerp":{"value":0.07},"gooey":{"value":true},"infiniteGooey":{"value":true},"growSize":{"value":2.18,"range":[1,15]},"durationOut":{"value":1,"range":[0.1,5]},"durationIn":{"value":1.5,"range":[0.1,5]},"displaceAmount":{"value":0.5},"masker":{"value":true},"maskVal":{"value":1,"range":[1,5]},"scrollType":{"value":0},"geoVertex":{"range":[1,64],"value":32},"noEffectGooey":{"value":false},"onMouse":{"value":1},"noise_speed":{"value":0.2,"range":[0,10]},"metaball":{"value":0.2,"range":[0,2],"_gsap":{"id":3}},"discard_threshold":{"value":0.5,"range":[0,1]},"antialias_threshold":{"value":0,"range":[0,0.1]},"noise_height":{"value":0.5,"range":[0,2]},"noise_scale":{"value":10,"range":[0,100]},"uFrequencyX":{"value":12,"range":[0,100]},"uFrequencyY":{"value":12,"range":[0,100]},"uFrequencyZ":{"value":10,"range":[0,100]}},
    gooey: true,
});

var elems = document.querySelectorAll(".elem");

elems.forEach(function(elem){
    var h1s = elem.querySelectorAll("h1");
    var index = 0;
    var animating = false;

document.querySelector("#main").addEventListener("click", function(){
    if(!animating){
        animating = true;
        gsap.to(h1s[index],{
            top:'-=100%',
            ease: Expo.easeInOut,
            duration:1,
            onComplete:function(){
                gsap.set(this._targets[0], {top: "100%"});
                animating = false;
            },
        });
    
        index === h1s.length - 1 ? (index = 0) : index++;
    
        gsap.to(h1s[index],{
            top:'-=100%',
            ease: Expo.easeInOut,
            duration:1,
        });
    }

});
})
// Footer brand animation
const footerBrand = document.querySelector('.brand h1');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Smooth fade in animation with GSAP
            gsap.fromTo(entry.target, 
                {
                    y: 100,
                    opacity: 0
                },
                {
                    duration: 2,
                    y: 0,
                    opacity: 1,
                    ease: "power3.out",
                    delay: 0.2,
                    // Ensure final state remains
                    clearProps: "transform"
                }
            );
        }
    });
}, {
    threshold: 0.2,
    rootMargin: "0px"
});

observer.observe(footerBrand);


// Select all elements with class 'element'
const elements = document.querySelectorAll(".element");

elements.forEach(function(element) {
    // Select the image directly within each element
    const elementImage = element.querySelector('img');
    
    element.addEventListener("mouseenter", function() {
        if (elementImage) {
            elementImage.style.opacity = 1;
        }
    });

    element.addEventListener("mouseleave", function() {
        if (elementImage) {
            elementImage.style.opacity = 0;
        }
    });

    element.addEventListener("mousemove", function(event) {
        if (elementImage) {
            // Get element's bounding rectangle
            const rect = element.getBoundingClientRect();
            
            // Calculate relative mouse position
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // Update image position with transform for better performance
            elementImage.style.transform = `translate(${x - 75}px, ${y - 75}px)`;
        }
    });
});

let map;
let marker;
let infoWindow;

function initMap() {
    // Default location (can be anywhere)
    const defaultLocation = { lat: 20.5937, lng: 78.9629 };

    // Initialize map
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 15,
        center: defaultLocation,
        styles: [
            {
                "featureType": "all",
                "elementType": "geometry",
                "stylers": [{"color": "#242f3e"}]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#746855"}]
            }
            // Add more styles as needed
        ]
    });

    infoWindow = new google.maps.InfoWindow();

    // Try to get user's location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                // Center map on user's location
                map.setCenter(pos);

                // Add marker for user's location
                marker = new google.maps.Marker({
                    position: pos,
                    map: map,
                    title: "Your Location",
                    animation: google.maps.Animation.DROP
                });

                // Get and display address
                getAddress(pos);

                // Setup nearby gyms search
                document.getElementById('find-gyms').addEventListener('click', () => {
                    findNearbyGyms(pos);
                });
            },
            () => {
                handleLocationError(true, infoWindow, map.getCenter());
            }
        );
    } else {
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function getAddress(location) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: location }, (results, status) => {
        if (status === "OK") {
            if (results[0]) {
                document.getElementById('address').textContent = 
                    `📍 ${results[0].formatted_address}`;
            }
        }
    });
}

function findNearbyGyms(location) {
    const service = new google.maps.places.PlacesService(map);
    service.nearbySearch(
        {
            location: location,
            radius: 1500,
            type: ["gym"]
        },
        (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                results.forEach(place => {
                    new google.maps.Marker({
                        map: map,
                        position: place.geometry.location,
                        title: place.name,
                        icon: {
                            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                        }
                    });
                });
            }
        }
    );
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Error: The Geolocation service failed."
            : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
}




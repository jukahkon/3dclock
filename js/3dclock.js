
var scene, camera, renderer;
var cameraControls;
var controller;
var clock;
var body;
var face;
var nut;
var hourHand;
var minuteHand;
var secondHand;
var glass;
var cover;
var gear1;
var gear2;
var gear3;
var time = { hour: 0, minutes: 0, seconds: 0 };
var clipPlanes = [
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), 10),
    new THREE.Plane(new THREE.Vector3(0, -1, 0), 10)
];

var timer = setInterval(tick, 1000);

function tick() {
    if (controller.exploded)
        return;

    if (time.seconds < 2 * Math.PI) {
        var s = time.seconds + (2 * Math.PI) / 60;
        dynamics.animate( time,
                          { seconds: s },
                          {
                            type: dynamics.spring,
                            duration: 200,
                            frequency: 253,
                            friction: 300
                          });
    } else {
        time.seconds = 0;
        syncTime();
        tick();
    }
}

function init(width, height) {
    // CAMERA
    camera = new THREE.PerspectiveCamera(35, width / height, 10, 5000);
    camera.position.z = 438;
    camera.position.x = 254;
    camera.position.y = 26;

    // RENDERER
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
    var clearColor = new THREE.Color(0x000000);
    renderer.setClearColor(clearColor, 1.0);

    // CONTROLS
    cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
}

function fillScene() {
    scene = new THREE.Scene();

    clock = new THREE.Object3D();

    // CLOCK BODY
    var bodyMtlLoader = new THREE.MTLLoader();
    bodyMtlLoader.load('../obj/Body.mtl', function (materials) {
        materials.preload();
        var loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.load(
            '../obj/Body.obj',
            function (object) {
                object.traverse(function (node) {
                    if (node instanceof THREE.Mesh) {
                        node.castShadow = true;
                    }
                });
                body = object;
                clock.add(object);            
            }
        );
    });

    // CLOCK FACE
    var faceMtlLoader = new THREE.MTLLoader();
    faceMtlLoader.load('../obj/Face.mtl', function (materials) {
        materials.preload();
        var loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.load(
            '../obj/Face.obj',
            function (object) {
                face = new THREE.Object3D();
                face.add(object);
                var faceGeometry = new THREE.RingGeometry(4, 130, 60, 60);
                var faceTexture = new THREE.TextureLoader().load("obj/face.png");
                var faceMaterial = new THREE.MeshLambertMaterial({ map: faceTexture, side: THREE.DoubleSide, color: 0xFFFFFF });
                facePlate = new THREE.Mesh(faceGeometry, faceMaterial);
                facePlate.position.z = 2.1;
                face.add(facePlate);
                face.traverse(function (node) { if (node instanceof THREE.Mesh) { node.receiveShadow = true; node.castShadow = true; } });
                clock.add(face);
                
            }
        );
    });

    // AXIS FOR HANDS
    var axisMtlLoader = new THREE.MTLLoader();
    axisMtlLoader.load('../obj/Axis.mtl', function (materials) {
        materials.preload();
        var loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.load(
            '../obj/Axis.obj',
            function (object) {
                object.traverse(function (node) { if (node instanceof THREE.Mesh) { node.castShadow = true; } });
                object.position.z = -5;
                clock.add(object);
            }
        );
    });

    // 6MM NUT
    var nutMtlLoader = new THREE.MTLLoader();
    nutMtlLoader.load('../obj/Nut6.mtl', function (materials) {
        materials.preload();
        var loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.load(
            '../obj/Nut6.obj',
            function (object) {
                object.traverse(function (node) { if (node instanceof THREE.Mesh) { node.castShadow = true; } });
                object.position.z = 2.0;
                nut = object;
                clock.add(object);
            }
        );
    });

    // HOUR HAND
    var hhMtlLoader = new THREE.MTLLoader();
    hhMtlLoader.load('../obj/HourHand.mtl', function (materials) {
        materials.preload();
        var loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.load(
            '../obj/HourHand.obj',
            function (object) {
                object.position.z = 5.0;
                object.rotation.z = 90 * Math.PI / 180;
                hourHand = object;
                clock.add(object);
            }
        );
    });

    // MINUTE HAND
    var mhMtlLoader = new THREE.MTLLoader();
    mhMtlLoader.load('../obj/MinuteHand.mtl', function (materials) {
        materials.preload();
        var loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.load(
            '../obj/MinuteHand.obj',
            function (object) {
                object.traverse(function (node) { if (node instanceof THREE.Mesh) { node.castShadow = true; } });
                object.position.z = 8.0;
                object.rotation.z = 45 * Math.PI / 180;
                minuteHand = object;
                clock.add(object);
            }
        );
    });

    // SECOND HAND
    var shMtlLoader = new THREE.MTLLoader();
    shMtlLoader.load('../obj/SecondHand.mtl', function (materials) {
        materials.preload();
        var loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.load(
            '../obj/SecondHand.obj',
            function (object) {
                object.traverse(function (node) { if (node instanceof THREE.Mesh) { node.castShadow = true; } });
                object.position.z = 12.0;
                object.rotation.z = 0 * Math.PI / 180;
                secondHand = object;
                clock.add(object);
            }
        );
    });

    // COVER GLASS
    var glassMtlLoader = new THREE.MTLLoader();
    glassMtlLoader.load('../obj/Glass.mtl', function (materials) {
        materials.preload();
        var loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.load(
            '../obj/Glass.obj',
            function (object) {
                object.position.z = 20.0;
                glass = object;
                clock.add(object);
            }
        );
    });

    // SOME GEARS
    var gear1MtlLoader = new THREE.MTLLoader();
    gear1MtlLoader.load('../obj/GearWheel1.mtl', function (materials) {
        materials.preload();
        var loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.load(
            '../obj/GearWheel1.obj',
            function (object) {
                object.position.z = -9.0;
                gear1 = object;
                clock.add(object);
            }
        );
    });

    var gear2MtlLoader = new THREE.MTLLoader();
    gear2MtlLoader.load('../obj/GearWheel2.mtl', function (materials) {
        materials.preload();
        var loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.load(
            '../obj/GearWheel2.obj',
            function (object) {
                object.position.z = -13.0;
                gear2 = object;
                clock.add(object);
            }
        );
    });

    var gear3MtlLoader = new THREE.MTLLoader();
    gear3MtlLoader.load('../obj/GearWheel3.mtl', function (materials) {
        materials.preload();
        var loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.load(
            '../obj/GearWheel3.obj',
            function (object) {
                object.position.z = -17.0;
                gear3 = object;
                clock.add(object);
            }
        );
    });

    // BACK COVER
    var coverMtlLoader = new THREE.MTLLoader();
    coverMtlLoader.load('../obj/BackCover.mtl', function (materials) {
        materials.preload();
        var loader = new THREE.OBJLoader();
        loader.setMaterials(materials);
        loader.load(
            '../obj/BackCover.obj',
            function (object) {
                cover = new THREE.Object3D();
                cover.add(object);
                var coverGeometry = new THREE.CircleGeometry(140, 60);
                var coverTexture = new THREE.TextureLoader().load("obj/cover.png");
                var coverMaterial = new THREE.MeshLambertMaterial({ map: coverTexture, side: THREE.FrontSide, transparent: true });
                coverPlate = new THREE.Mesh(coverGeometry, coverMaterial);
                coverPlate.position.z = -6;
                coverPlate.rotation.x = 180 * Math.PI / 180;
                coverPlate.rotation.z = 180 * Math.PI / 180;
                cover.add(coverPlate);
                cover.position.z = -26.0;
                clock.add(cover);
            }
        );
    });

    scene.add(clock);
    
    // LIGHTNING
    var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.3);
    scene.add(ambientLight);

    var light = new THREE.DirectionalLight(0xFFFFFF, 0.1);
    light.position.set(-100, 100, 200);

    light.shadow.camera.left = -200;
    light.shadow.camera.right = 200;
    light.shadow.camera.top = 200;
    light.shadow.camera.bottom = -200;
    light.shadow.camera.near = 10;
    light.shadow.camera.far = 1000;

    light.castShadow = true;
    scene.add(light);

    var lights = [];
    lights[0] = new THREE.PointLight(0xffffff, 1, 0);
    lights[1] = new THREE.PointLight(0xffffff, 1, 0);
    lights[2] = new THREE.PointLight(0xffffff, 1, 0);
    lights[0].position.set(0, 200, -10);
    lights[1].position.set(200, 200, 200);
    lights[2].position.set(-300, -300, -300);
    scene.add(lights[0]);
    scene.add(lights[1]);
    scene.add(lights[2]);

    // FOR DEBUGGING
    // var shadowCamera = new THREE.CameraHelper(light.shadow.camera);
    // scene.add(shadowCamera);
    // Coordinates.drawAllAxes({ axisLength: 200, axisRadius: 1, axisTess: 50 });
    // Coordinates.drawGrid({ size: 1000, scale: 0.01, orientation: "x" });
}

function addToDOM() {
    var container = document.getElementById('container');
    var canvas = container.getElementsByTagName('canvas');
    if (canvas.length > 0) {
        container.removeChild(canvas[0]);
    }

    container.appendChild(renderer.domElement);
}

function render() {
    cameraControls.update();

    var theta = controller.yaw * Math.PI / 180;

    // no animation in exploded state
    if (!controller.exploded) {
        if (clock) {
            clock.rotation.y = -theta
        }

        if (hourHand) {
            hourHand.rotation.z = -1 * time.hours;
        }

        if (minuteHand) {
            minuteHand.rotation.z = -1 * time.minutes;
        }

        if (secondHand) {
            secondHand.rotation.z = -1 * time.seconds;
        }

        if (gear1) {
            gear1.rotation.z = -1 * time.seconds;
        }
    }

    requestAnimationFrame(render);
    renderer.render(scene, camera);
}

function setupGui() {
    controller = {
        exploded: false,
        transparency: false,
        colors: false,
        clipping: false,
        yaw: 10
    };


    var origColor = undefined;

    var gui = new dat.GUI();
    var exploded = gui.add(controller, "exploded");
    var transparency = gui.add(controller, "transparency");
    var colors = gui.add(controller, "colors");
    var clipping = gui.add(controller, "clipping");
    gui.add(controller, "yaw", 0, 360).name("rotation");

    exploded.onChange(function (value) {
        console.log("exploded: " + value);
        if (face) {
            var pos = value ? 50 : 0;
            dynamics.animate(face.position,
                              { z: pos },
                              {
                                  type: dynamics.easeIn,
                                  duration: 500,
                              });
        }

        if (nut) {
            var pos = value ? 55 : 2.0;
            dynamics.animate(nut.position,
                              { z: pos },
                              {
                                  type: dynamics.easeIn,
                                  duration: 500,
                              });
        }

        if (hourHand) {
            var pos = value ? 65 : 5.0;
            dynamics.animate(hourHand.position,
                              { z: pos },
                              {
                                  type: dynamics.easeIn,
                                  duration: 500,
                              });
        }

        if (minuteHand) {
            var pos = value ? 75 : 8.0;
            dynamics.animate(minuteHand.position,
                              { z: pos },
                              {
                                  type: dynamics.easeIn,
                                  duration: 500,
                              });
        }

        if (secondHand) {
            var pos = value ? 85 : 12.0;
            dynamics.animate(secondHand.position,
                              { z: pos },
                              {
                                  type: dynamics.easeIn,
                                  duration: 500,
                              });
        }

        if (glass) {
            var pos = value ? 90 : 20.0;
            dynamics.animate(glass.position,
                              { z: pos },
                              {
                                  type: dynamics.easeIn,
                                  duration: 500,
                              });
        }

        if (gear1) {
            var pos = value ? -60 : -9.0;
            dynamics.animate(gear1.position,
                              { z: pos },
                              {
                                  type: dynamics.easeIn,
                                  duration: 500,
                              });
        }

        if (gear2) {
            var pos = value ? -70 : -13.0;
            dynamics.animate(gear2.position,
                              { z: pos },
                              {
                                  type: dynamics.easeIn,
                                  duration: 500,
                              });
        }

        if (gear3) {
            var pos = value ? -80 : -17.0;
            dynamics.animate(gear3.position,
                              { z: pos },
                              {
                                  type: dynamics.easeIn,
                                  duration: 500,
                              });
        }

        if (cover) {
            var pos = value ? -100 : -26.0;
            dynamics.animate(cover.position,
                              { z: pos },
                              {
                                  type: dynamics.easeIn,
                                  duration: 500,
                              });
        }

        if (!value) {
            syncTime();
        }
    });

    transparency.onChange(function (value) {
        console.log("transparency: " + value);
        var mat = body.children[0].material;

        if (value) {
            mat.opacity = 0.5;
            mat.transparent = true;
        } else {
            mat.opacity = 1.0;
            mat.transparent = false;
        }
    });

    colors.onChange(function (value) {
        console.log("colors: " + value);
        var bmat = body.children[0].material;
        var cmat = cover.children[0].children[0].material;

        if (!origColor) {
            origColor = bmat.color.clone();
        }

        if (value) {
            bmat.color.setRGB(1.0, 0.5, 0.0);
            cmat.color.setRGB(1.0, 0.5, 0.0);
        } else {
            bmat.color.set(origColor);
            cmat.color.set(origColor);
        }
    });

    clipping.onChange(function (value) {
        console.log("clipping: " + value);
        clock.traverse(function (node) {
            if (node instanceof THREE.Mesh && node.material && !node.name.includes('Gear')) {
                node.material.clippingPlanes = value ? clipPlanes : [];
                node.material.clipIntersection = value;
            }
        });

        renderer.localClippingEnabled = true;
    });
}

function syncTime() {
    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();

    if (hours >= 11) {
        hours = hours - 12;
    }

    time.hours = (hours + minutes/60) * Math.PI / 6;
    time.minutes = minutes * Math.PI / 30;
    time.seconds = currentTime.getSeconds() * Math.PI/30;

}

$(document).ready(function () {
    console.log("main >");
    var width = $('#container').width();
    var height = $('#container').height();
    console.log("render area: " + width + " x " + height);

    try {
        init(width, height);
        fillScene();
        addToDOM();
        setupGui();
        syncTime();
        render();
    } catch (e) {
        console.log("ERROR: " + e)
    }

    window.addEventListener('resize', onWindowResize, false);
});

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

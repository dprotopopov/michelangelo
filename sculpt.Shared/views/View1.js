
sculpt.View1 = function (params) {
    var viewModel = {
        filename: ko.observable('untitled.json'),
        email: ko.observable(''),
        objUrl: ko.observable(''),
        openOverlayVisible: ko.observable(false),
        saveOverlayVisible: ko.observable(false),
        urlOverlayVisible: ko.observable(false),
        emailOverlayVisible: ko.observable(false),
    };

    var operation = 'substract';
    var scale = 0.1;
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    var directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    directionalLight = new THREE.DirectionalLight();
    directionalLight.position.set(-1, -1, 1).normalize();
    scene.add(directionalLight);

    var pointLight = new THREE.PointLight(0x000000, 2);
    pointLight.position.set(-2, +2, 2);
    scene.add(pointLight);

    pointLight = new THREE.PointLight(0x000000, 1.5);
    pointLight.position.set(2, -2, 2);
    scene.add(pointLight);

    var material = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
//    var material = new THREE.MeshNormalMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    var mesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);

    function rotateAroundWorldAxis(object, axis, grad) {
        var rotWorldMatrix = new THREE.Matrix4();
        rotWorldMatrix.makeRotationAxis(axis.normalize(), grad * Math.PI / 180);
        rotWorldMatrix.multiply(object.matrix); // pre-multiply
        object.matrix = rotWorldMatrix;
        object.rotation.setFromRotationMatrix(object.matrix);
    }

    var zoomIn = function (ev) {
//      console.log(ev);
        camera.fov /= 1.1;
        camera.updateProjectionMatrix();
    };
    var zoomOut = function (ev) {
//      console.log(ev);
        camera.fov *= 1.1;
        camera.updateProjectionMatrix();
    };
    var rotateLeft = function (ev) {
//      console.log(ev);
        var yAxis = new THREE.Vector3(0, 1, 0);
        rotateAroundWorldAxis(mesh, yAxis, -15);
    };
    var rotateRight = function (ev) {
//      console.log(ev);
        var yAxis = new THREE.Vector3(0, 1, 0);
        rotateAroundWorldAxis(mesh, yAxis, 15);
    };
    var rotateUp = function (ev) {
//      console.log(ev);
        var xAxis = new THREE.Vector3(1, 0, 0);
        rotateAroundWorldAxis(mesh, xAxis, -15);
    };
    var rotateDown = function (ev) {
//      console.log(ev);
        var xAxis = new THREE.Vector3(1, 0, 0);
        rotateAroundWorldAxis(mesh, xAxis, 15);
    };

    var viewShown = function (e) {

        scene.add(mesh);
        camera.position.z = 5;

        var canvas = $("#myCanvas").get(0);

        // Check whether the browser supports WebGL. If so, instantiate the hardware accelerated
        // WebGL renderer. For antialiasing, we have to enable it. The canvas renderer uses
        // antialiasing by default.
        // The approach of multiplse renderers is quite nice, because your scene can also be
        // viewed in browsers, which don't support WebGL. The limitations of the canvas renderer
        // in contrast to the WebGL renderer will be explained in the tutorials, when there is a
        // difference.
        if (Detector.webgl) {
            var renderer = new THREE.WebGLRenderer({
                canvas: canvas
            });

            // If its not supported, instantiate the canvas renderer to support all non WebGL
            // browsers
        } else {
            var renderer = new THREE.CanvasRenderer({
                canvas: canvas
            });
        }

        //var renderer = new THREE.WebGLRenderer({
        //    canvas: canvas
        //});

        //var renderer = new THREE.CanvasRenderer({
        //    canvas: canvas
        //});

        renderer.setSize(window.innerWidth, window.innerHeight);

        // requestAnim shim layer by Paul Irish
        var requestAnimFrame = (function () {
            return window.requestAnimationFrame ||
                    window.webkitRequestAnimationFrame ||
                    window.mozRequestAnimationFrame ||
                    window.oRequestAnimationFrame ||
                    window.msRequestAnimationFrame ||
                    function (/* function */ callback, /* DOMElement */ element) {
                        window.setTimeout(callback, 1000 / 60);
                    };
        })();

        var render = function () {
            requestAnimFrame(render);
            renderer.render(scene, camera);
        };

        requestAnimFrame(render);


        $(canvas).on('click', function (event) {
            console.log(event);
            var mouse3D = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, //x
                -(event.clientY / window.innerHeight) * 2 + 1, //y
                0.5); //z
            var projector = new THREE.Projector();
            var raycaster = projector.pickingRay(mouse3D.clone(), camera);
            var intersects = raycaster.intersectObjects(scene.children);
            // Change color if hit block
            if (intersects.length > 0) {
                var tool = new THREE.Mesh(new THREE.SphereGeometry(scale, 4, 4), material);
                var point = intersects[0].point;
                console.log(point);
                tool.position.x = point.x;
                tool.position.y = point.y;
                tool.position.z = point.z;
                console.log(tool.position);
                var bsp1 = new ThreeBSP(mesh);
                var bsp2 = new ThreeBSP(tool);

                if (operation == "substract") {
                    var bsp3 = bsp1.subtract(bsp2);
                } else if (operation == "union") {
                    var bsp3 = bsp1.union(bsp2);
                }

                var object = bsp3.toMesh(material);
                object.geometry.computeVertexNormals();

                scene.add(object);
                scene.remove(mesh);
                mesh = object;
            }
        });

        var hammer = new Hammer(canvas);
        hammer.on('swipe swipeleft', rotateLeft);
        hammer.on('swipe swiperight', rotateRight);
        hammer.on('swipe swipeup', rotateUp);
        hammer.on('swipe swipedown', rotateDown);
        hammer.on('pinchin', zoomOut);
        hammer.on('pinchout', zoomIn);

        $(window).resize(function () {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    };

    function FileSystemFail(evt) {
        alert('Error:' + evt.error.code.toString());
    }

    function GetFileEntryWriter(fileEntry) {
        fileEntry.createWriter(WriteFile, FileSystemFail);
    }

    function WriteFile(writer) {
        writer.onwrite = function (evt) {
            alert("Writing complete");
        };
        var geometry = mesh.geometry;
        writer.write(JSON.stringify(geometry));
    }

    function GetFileEntryWriter(fileEntry) {
        fileEntry.createWriter(WriteFile, FileSystemFail);
    }

    function GetFileEntryReader(fileEntry) {
        fileEntry.file(ReadFile, FileSystemFail);
    }

    function ReadFile(file) {
        var reader = new FileReader();
        reader.onloadend = function (evt) {
            var geometry = new THREE.JSONLoader().parse(evt.target.result);
            var object = new THREE.Mesh(geometry, material);
            scene.add(object);
            scene.remove(mesh);
            mesh = object;
            alert('Reading complete.');
        };
        reader.readAsText(file);
    }

    viewModel = $.extend(viewModel, {
        //  Put the binding properties here
        viewShown: viewShown,

        toolbarItems: [
            { location: 'before', widget: 'button', options: { icon: 'arrowleft', clickAction: rotateLeft } },
            { location: 'before', widget: 'button', options: { icon: 'arrowright', clickAction: rotateRight } },
            { location: 'before', widget: 'button', options: { icon: 'image', clickAction: zoomOut } },
            { location: 'after', widget: 'button', options: { icon: 'find', clickAction: zoomIn } },
            { location: 'after', widget: 'button', options: { icon: 'arrowup', clickAction: rotateUp } },
            { location: 'after', widget: 'button', options: { icon: 'arrowdown', clickAction: rotateDown } },
            {
                location: 'center',
                widget: 'dropDownMenu',
                options: {
                    buttonText: 'file',
                    options: { icon: 'home' },
                    items: [
                        { text: "open", icon: 'doc', ko: viewModel.openOverlayVisible },
                        { text: "open from url", icon: 'globe', ko: viewModel.urlOverlayVisible },
                        { text: "save as", icon: 'save', ko: viewModel.saveOverlayVisible },
                        { text: "email", icon: 'email', ko: viewModel.emailOverlayVisible }
                    ],
                    itemClickAction: function (e) {
                        e.itemData.ko(true);
                    }
                }
            },
            {
                location: 'center',
                widget: 'dropDownMenu',
                options: {
                    buttonText: 'scale',
                    options: { icon: 'edit' },
                    items: [
                        { text: "1x", scale: 0.1 },
                        { text: "2x", scale: 0.2 },
                        { text: "4x", scale: 0.4 },
                        { text: "8x", scale: 0.8 }
                    ],
                    itemClickAction: function (e) {
                        scale = e.itemData.scale;
                    }
                }
            },
            {
                location: 'center',
                widget: 'dropDownMenu',
                options: {
                    buttonText: 'operation',
                    options: { icon: 'toolbox' },
                    items: [
                        "substract",
                        "union"
                    ],
                    itemClickAction: function (e) {
                        operation = e.itemData;
                    }
                }
            },
        ],
        showEmailOverlay: function () {
            viewModel.emailOverlayVisible(true);
        },
        cancelEmailOverlay: function () {
            viewModel.emailOverlayVisible(false);
        },
        okEmailOverlay: function () {
            viewModel.emailOverlayVisible(false);
            viewModel.email($('#email').dxTextBox('option', 'value'));
            var geometry = mesh.geometry;
            window.open('mailto:' + viewModel.email() + '?subject=' + viewModel.filename() + '&body=' + JSON.stringify(geometry));
        },
        showOpenOverlay: function () {
            viewModel.openOverlayVisible(true);
        },
        cancelOpenOverlay: function () {
            viewModel.openOverlayVisible(false);
        },
        okOpenOverlay: function () {
            viewModel.openOverlayVisible(false);
            viewModel.filename($('#openfilename').dxTextBox('option', 'value'));
            if (sculpt.app.fileSystem == null) {
                alert('File system is not accessible');
                return;
            }
            sculpt.app.fileSystem.root.getFile(viewModel.filename(), { create: true }, GetFileEntryReader, FileSystemFail);
        },
        cancelSaveOverlay: function () {
            viewModel.saveOverlayVisible(false);
        },
        okSaveOverlay: function () {
            viewModel.saveOverlayVisible(false);
            viewModel.filename($('#savefilename').dxTextBox('option', 'value'));
            if (sculpt.app.fileSystem == null) {
                alert('File system is not accessible');
                return;
            }
            sculpt.app.fileSystem.root.getFile(viewModel.filename(), { create: true }, GetFileEntryWriter, FileSystemFail);
        },
        cancelUrlOverlay: function () {
            viewModel.urlOverlayVisible(false);
        },
        okUrlOverlay: function () {
            viewModel.urlOverlayVisible(false);
            viewModel.objUrl($('#url').dxTextBox('option', 'value'));
            var loader = new THREE.ObjectLoader();
            loader.load(viewModel.objUrl(), function (object) {
                scene.remove(mesh);
                scene.add(object);
                mesh = object;
            });
        },
    });

    return viewModel;
};
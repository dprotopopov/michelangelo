
$(function() {
    var startupView = "View1";

    // Uncomment the line below to disable platform-specific look and feel and to use the Generic theme for all devices
    // DevExpress.devices.current({ platform: "generic" });

    if(DevExpress.devices.real().platform === "win8") {
        $("body").css("background-color", "#000");
    }

    document.addEventListener("deviceready", onDeviceReady, false);
    
    function onDeviceReady() {
        navigator.splashscreen.hide();
        document.addEventListener("backbutton", onBackButton, false);
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
    }
    function gotFS(fileSystem) {
        sculpt.app.fileSystem = fileSystem;
    }
    function fail(evt) {
        console.log(evt.error.code);
    }

    function onBackButton() {
        DevExpress.hardwareBackButton.fire();
    }

    function onNavigatingBack(e) {
        if(e.isHardwareButton && !sculpt.app.canBack()) {
            e.cancel = true;
            exitApp();
        }
    }

    function exitApp() {
        switch (DevExpress.devices.real().platform) {
            case "tizen":
                tizen.application.getCurrentApplication().exit();
                break;
            case "android":
                navigator.app.exitApp();
                break;
            case "win8":
                window.external.Notify("DevExpress.ExitApp");
                break;
        }
    }

    sculpt.app = new DevExpress.framework.html.HtmlApplication({
        namespace: sculpt,
        layoutSet: DevExpress.framework.html.layoutSets[sculpt.config.layoutSet],
        navigation: sculpt.config.navigation
    });

    $(window).unload(function() {
        sculpt.app.saveState();
    });

    sculpt.app.router.register(":view/:id", { view: startupView, id: undefined });
    sculpt.app.navigatingBack.add(onNavigatingBack);
    sculpt.app.navigate();
});
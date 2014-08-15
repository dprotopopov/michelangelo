
$(function() {
    var startupView = "View1";

    DevExpress.devices.current("desktop");

    sculpt.app = new DevExpress.framework.html.HtmlApplication({
        namespace: sculpt,
        layoutSet: DevExpress.framework.html.layoutSets[sculpt.config.layoutSet],
        mode: "webSite",
        navigation: sculpt.config.navigation
    });

    $(window).unload(function() {
        sculpt.app.saveState();
    });

    sculpt.app.router.register(":view/:id", { view: startupView, id: undefined });
    sculpt.app.navigate();
});
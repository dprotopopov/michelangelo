
$(function() {
    var startupView = "View1";


    sculpt.app = new DevExpress.framework.html.HtmlApplication({
        namespace: sculpt,
        layoutSet: DevExpress.framework.html.layoutSets[sculpt.config.layoutSet],
        navigation: sculpt.config.navigation
    });

    $(window).unload(function() {
        sculpt.app.saveState();
    });

    sculpt.app.router.register(":view/:id", { view: startupView, id: undefined });
    sculpt.app.navigate();
});
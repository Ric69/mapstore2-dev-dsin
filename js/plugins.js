/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * MODIFY BY CNR (EL) FRANCE - LYON - 2021
 *
 */

/**
  * Please, keep them sorted alphabetically
 */
export default {
    plugins: {
        // product plugins
        // AboutPlugin: require('@mapstore/product/plugins/About').default,
        AboutPlugin: require('@js/plugins/plugins/AboutCNR').default,
        // AttributionPlugin: require('@mapstore/product/plugins/Attribution').default,
        AttributionPlugin: require('@js/plugins/plugins/AttributionCNR').default,
        AutoLogin: require('@js/plugins/AutoLoginSSO').default,
        // ExamplesPlugin: require('@mapstore/product/plugins/Examples').default,
        // FooterPlugin: require('@mapstore/product/plugins/Footer'),
        FooterPlugin: require('@js/plugins/plugins/FooterCNR'),
        // ForkPlugin: require('@mapstore/product/plugins/Fork').default,
        // HeaderPlugin: require('@mapstore/product/plugins/Header').default,
        HeaderPlugin: require('@js/plugins/plugins/HeaderCNR').default,
        // HomeDescriptionPlugin: require('@mapstore/product/plugins/HomeDescription').default,
        HomeDescriptionPlugin: require('@js/plugins/plugins/HomeDescriptionCNR').default,
        MadeWithLovePlugin: require('@mapstore/product/plugins/MadeWithLove').default,
        // MailingListsPlugin: require('@mapstore/product/plugins/MailingLists').default,
        MapTypePlugin: require('@mapstore/product/plugins/MapType').default,
        // NavMenu: require('@mapstore/product/plugins/NavMenu').default,
        NavMenu: require('@js/plugins/plugins/NavMenuCNR').default,
        // framework plugins
        AddGroupPlugin: require('@mapstore/plugins/AddGroup').default,
        AnnotationsPlugin: require('@mapstore/plugins/Annotations').default,
        // AppSeismePlugin: require('@js/plugins/AppSeisme/AppSeisme').default,
        AutoMapUpdatePlugin: require('@mapstore/plugins/AutoMapUpdate').default,
        // AZoomPlugin: require('@js/plugins/AZoom/AZoomSample'),
        BackgroundSelectorPlugin: require('@mapstore/plugins/BackgroundSelector').default,
        BurgerMenuPlugin: require('@mapstore/plugins/BurgerMenu').default,
        CRSSelectorPlugin: require('@mapstore/plugins/CRSSelector').default,
        ContentTabs: require('@mapstore/plugins/ContentTabs').default,
        ContextPlugin: require('@mapstore/plugins/Context').default,
        ContextCreatorPlugin: require('@mapstore/plugins/ContextCreator').default,
        // ContextManagerPlugin: require('@js/plugins/contextmanager/ContextManager').default,
        ContextManagerPlugin: require('@mapstore/plugins/contextmanager/ContextManager').default,
        CookiePlugin: require('@mapstore/plugins/Cookie').default,
        CreateNewMapPlugin: require('@mapstore/plugins/CreateNewMap').default,
        Dashboard: require('@mapstore/plugins/Dashboard').default,
        DashboardEditor: require('@mapstore/plugins/DashboardEditor').default,
        DashboardsPlugin: require('@mapstore/plugins/Dashboards').default,
        DetailsPlugin: require('@mapstore/plugins/Details').default,
        DrawerMenuPlugin: require('@mapstore/plugins/DrawerMenu').default,
        ExpanderPlugin: require('@mapstore/plugins/Expander').default,
        FeatureEditorPlugin: require('@mapstore/plugins/FeatureEditor').default,
        FeaturedMaps: require('@mapstore/plugins/FeaturedMaps').default,
        FeedbackMaskPlugin: require('@mapstore/plugins/FeedbackMask').default,
        FilterLayerPlugin: require('@mapstore/plugins/FilterLayer').default,
        FloatingLegendPlugin: require('@mapstore/plugins/FloatingLegend').default,
        FullScreenPlugin: require('@mapstore/plugins/FullScreen').default,
        GeoStoryPlugin: require('@mapstore/plugins/GeoStory').default,
        GeoStoriesPlugin: require('@mapstore/plugins/GeoStories').default,
        GeoStoryEditorPlugin: require('@mapstore/plugins/GeoStoryEditor').default,
        GeoStorySavePlugin: require('@mapstore/plugins/GeoStorySave').GeoStorySave,
        GeoStorySaveAsPlugin: require('@mapstore/plugins/GeoStorySave').GeoStorySaveAs,
        DashboardSavePlugin: require('@mapstore/plugins/DashboardSave').DashboardSave,
        DashboardSaveAsPlugin: require('@mapstore/plugins/DashboardSave').DashboardSaveAs,
        GeoStoryNavigationPlugin: require('@mapstore/plugins/GeoStoryNavigation').default,
        GlobeViewSwitcherPlugin: require('@mapstore/plugins/GlobeViewSwitcher').default,
        GoFull: require('@mapstore/plugins/GoFull').default,
        GridContainerPlugin: require('@mapstore/plugins/GridContainer').default,
        GroupManagerPlugin: require('@mapstore/plugins/manager/GroupManager').default,
        HelpLinkPlugin: require('@mapstore/plugins/HelpLink').default,
        HelpPlugin: require('@mapstore/plugins/Help').default,
        HomePlugin: require('@mapstore/plugins/Home').default,
        IdentifyPlugin: require('@mapstore/plugins/Identify').default,
        LanguagePlugin: require('@mapstore/plugins/Language').default,
        LayerDownload: require('@mapstore/plugins/LayerDownload').default,
        LayerInfoPlugin: require('@mapstore/plugins/LayerInfo').default,
        LocatePlugin: require('@mapstore/plugins/Locate').default,
        LoginPlugin: require('@mapstore/plugins/Login').default,
        ManagerMenuPlugin: require('@mapstore/plugins/manager/ManagerMenu').default,
        ManagerPlugin: require('@mapstore/plugins/manager/Manager').default,
        MapEditorPlugin: require('@mapstore/plugins/MapEditor').default,
        MapExportPlugin: require('@mapstore/plugins/MapExport').default,
        MapFooterPlugin: require('@mapstore/plugins/MapFooter').default,
        MapImportPlugin: require('@mapstore/plugins/MapImport').default,
        MapLoadingPlugin: require('@mapstore/plugins/MapLoading').default,
        MapPlugin: require('@mapstore/plugins/Map').default,
        MapSearchPlugin: require('@mapstore/plugins/MapSearch').default,
        MapsPlugin: require('@mapstore/plugins/Maps').default,
        MapCatalogPlugin: require('@mapstore/plugins/MapCatalog').default,
        MapTemplatesPlugin: require('@mapstore/plugins/MapTemplates').default,
        MeasurePlugin: require('@mapstore/plugins/Measure').default,
        MediaEditorPlugin: require('@mapstore/plugins/MediaEditor').default,
        MetadataExplorerPlugin: require('@mapstore/plugins/MetadataExplorer').default,
        MousePositionPlugin: require('@mapstore/plugins/MousePosition').default,
        NotificationsPlugin: require('@mapstore/plugins/Notifications').default,
        OmniBarPlugin: require('@mapstore/plugins/OmniBar').default,
        PlaybackPlugin: require('@mapstore/plugins/Playback.jsx').default,
        PrintPlugin: require('@mapstore/plugins/Print').default,
        QueryPanelPlugin: require('@mapstore/plugins/QueryPanel').default,
        RedirectPlugin: require('@mapstore/plugins/Redirect').default,
        RedoPlugin: require('@mapstore/plugins/History').default,
        RulesDataGridPlugin: require('@mapstore/plugins/RulesDataGrid').default,
        RulesEditorPlugin: require('@mapstore/plugins/RulesEditor').default,
        RulesManagerFooter: require('@mapstore/plugins/RulesManagerFooter').default,
        SavePlugin: require('@mapstore/plugins/Save').default,
        SaveAsPlugin: require('@mapstore/plugins/SaveAs').default,
        SaveStoryPlugin: require('@mapstore/plugins/GeoStorySave'),
        ScaleBoxPlugin: require('@mapstore/plugins/ScaleBox').default,
        ScrollTopPlugin: require('@mapstore/plugins/ScrollTop').default,
        SearchPlugin: require('@mapstore/plugins/Search').default,
        SearchServicesConfigPlugin: require('@mapstore/plugins/SearchServicesConfig').default,
        SearchByBookmarkPlugin: require('@mapstore/plugins/SearchByBookmark').default,
        SettingsPlugin: require('@mapstore/plugins/Settings').default,
        SharePlugin: require('@mapstore/plugins/Share'),
        SnapshotPlugin: require('@mapstore/plugins/Snapshot').default,
        StyleEditorPlugin: require('@mapstore/plugins/StyleEditor').default,
        SwipePlugin: require('@mapstore/plugins/Swipe').default,
        TOCItemsSettingsPlugin: require('@mapstore/plugins/TOCItemsSettings').default,
        TOCPlugin: require('@mapstore/plugins/TOC').default,
        ThematicLayerPlugin: require('@mapstore/plugins/ThematicLayer').default,
        ThemeSwitcherPlugin: require('@mapstore/plugins/ThemeSwitcher').default,
        TimelinePlugin: require('@mapstore/plugins/Timeline').default,
        ToolbarPlugin: require('@mapstore/plugins/Toolbar').default,
        TutorialPlugin: require('@mapstore/plugins/Tutorial').default,
        UndoPlugin: require('@mapstore/plugins/History').default,
        UserManagerPlugin: require('@mapstore/plugins/manager/UserManager').default,
        UserExtensionsPlugin: require('@mapstore/plugins/UserExtensions').default,
        UserSessionPlugin: require('@mapstore/plugins/UserSession').default,
        VersionPlugin: require('@mapstore/plugins/Version').default,
        WidgetsBuilderPlugin: require('@mapstore/plugins/WidgetsBuilder').default,
        WidgetsPlugin: require('@mapstore/plugins/Widgets').default,
        WidgetsTrayPlugin: require('@mapstore/plugins/WidgetsTray').default,
        ZoomAllPlugin: require('@mapstore/plugins/ZoomAll').default,
        ZoomInPlugin: require('@mapstore/plugins/ZoomIn').default,
        ZoomOutPlugin: require('@mapstore/plugins/ZoomOut').default
    },
    requires: {
        ReactSwipe: require('react-swipeable-views').default,
        SwipeHeader: require('@mapstore/components/data/identify/SwipeHeader').default
    }
};

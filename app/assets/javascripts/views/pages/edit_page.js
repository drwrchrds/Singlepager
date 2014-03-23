/*jshint  browser:  true,
           newcap:   true,
           nomen:    false,
           plusplus: false,
           undef:    false,
           white:    false */
/*global  Singlepager, Backbone */

Singlepager.Views.EditPage = Backbone.CompositeView.extend({
  template: JST['pages/show'],

  initialize: function() {
    this.listenTo(this.model, 'sync', this.render);
    this.listenTo(this.model.widgets(), 'reset sync', this.resetWidgets);
    this.listenTo(this.model.widgets(), 'add', this.addWidget);
    this.listenTo(this.model.widgets(), 'remove', this.removeWidget);

    this.model.widgets().each(this.addWidget.bind(this));
  },

  events: {
    "mouseenter .widgets .widget": 'showAddContent',
    "mouseleave .widgets .widget": 'hideAddContent',
    "click .add-contact-widget": 'newContactWidget',
    "click .add-text-widget": 'newTextWidget',
    'submit .new': 'submit',
    'click .cancel': 'cancel'
  },

  addWidget: function(widget) {
    var widgetsShowView = new Singlepager.Views.WidgetsShow({
      model: widget
    });

    this.addSubview('.widgets', widgetsShowView);
    widgetsShowView.render();
  },

  resetWidgets: function () {
    var that = this;
    this.model.widgets().sort().each(function (widget) {
      that.removeWidget(widget);
      that.addWidget(widget);
    });
  },

  makeSortable: function() {
    $('.widgets').sortable({
      cursor: 'move',
      stop: function(event, ui) {
        var $widget = ui.item;
        $widget.trigger('move');
      }
    });
  },

  removeWidget: function(widget) {
    var widgetsShowView = _(this.subviews()['.widgets']).find(function(subview) {
      return subview.model == widget; // how does this compare the two?
    });

    this.removeSubview('.widgets', widgetsShowView);
  },

  render: function() {
    var renderedContent = this.template({
      page: this.model
    });
    this.$el.html(renderedContent);
    this.setTheme();
    this.makeSortable();

    return this;
  },

  setTheme: function() {
    $('body').addClass("carbon");
    window.document.title = this.model.get('company');
  },

  showAddContent: function(event) {
    event.preventDefault();

    $(event.currentTarget).find('.add-widget-container').slideToggle('fast');
    $(event.currentTarget).find('.edit').fadeIn('fast')
  },

  hideAddContent: function(event) {
    event.preventDefault();
    $(event.currentTarget).find('.add-widget-container').slideToggle('fast');
    $(event.currentTarget).find('.edit').fadeOut('fast')
  },

  // showWidgetOptions: function(event) {
  //   event.preventDefault()
  //   $(event.currentTarget).parent().toggle('fast')
  //
  //
  //   $(event.currentTarget).after(JST['widgets/options']())
  // },

  newContactWidget: function (event) {
    event.preventDefault();

    var widget = new Singlepager.Models.ContactWidget();
    var $prevWidget = $(event.currentTarget).parent().parent();
    var rank = this.getRank($prevWidget);
    this.newWidget(widget, $prevWidget, rank);
  },

  newTextWidget: function (event) {
    event.preventDefault();

    var widget = new Singlepager.Models.TextWidget();
    var $prevWidget = $(event.currentTarget).parent().parent();
    var rank = this.getRank($prevWidget);
    this.newWidget(widget, $prevWidget, rank);
  },

  getRank: function (prevWidget) {
    var prevId = prevWidget.data('id');
    var prevRank = this.model.widgets().get(prevId).get('rank');
    var nextId = prevWidget.next().data('id');
    var newRank;
    if(nextId) {
      var nextRank = this.model.widgets().get(nextId).get('rank');
      newRank = (prevRank + nextRank) / 2;
    } else {
      newRank = prevRank + 1;
    }
    return newRank;
  },

  newWidget: function(widget, prevWidget, rank) { // replace this with new widget form
    var form = JST['widgets/form']({
      widget: widget,
      newOrEdit: 'new',
      page_id: this.model.id,
      rank: rank
    });

    prevWidget.after(form);
  },

  submit: function(event) {
    event.preventDefault();

    var view = this;
    var params = $(event.currentTarget).serializeJSON();
    var widget = new Singlepager.Models.Widget(params);

    widget.save({}, {
      wait: true,
      success: function(model) {
        view.model.widgets().add(model);
        view.$('#newForm').remove();
        view.renderSubviews();
      }
    });
  },

  cancel: function(event) {
    event.preventDefault();
    $(event.currentTarget).parents('li').remove();

    // $('.widgets').on('mouseenter mouseleave', true)
  }

});
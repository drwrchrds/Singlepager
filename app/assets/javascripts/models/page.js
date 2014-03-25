/*jshint  browser:  true,
           newcap:   true,
           nomen:    false,
           plusplus: false,
           undef:    false,
           white:    false */
/*global  Singlepager, Backbone */

Singlepager.Models.Page = Backbone.Model.extend({
  urlRoot: '/pages',

  widgets: function() {
    if(!this._widgets) {
      this._widgets = new Singlepager.Collections.Widgets([], {
        page: this
      });
    }
    return this._widgets;
  },

  parse: function(response) {
    if(response.widgets) {
      this.widgets().set(); // this isn't doing anything - why does it break the show view?
      delete response.widgets;
    }
    return response;
  }
});

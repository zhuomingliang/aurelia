// Do we want any NS-specific binding commands? The html-specific ones are: .class, .style, .delegate, etc.
// Possibly we need to just abstract the html ones a bit better so they can be reused, as there isn't any real html-specific logic in any of them. They're just connected to html-specific stuff, is all. The only real dependency is on the DOM typings.

package widget

import (
	"context"
	"fmt"
	"github.com/glanceapp/glance/internal/assets"
	"html/template"
	"strings"
)

type SearchBang struct {
	Title    string
	Shortcut string
	URL      string
	Icon     string
}

type Search struct {
	widgetBase   `yaml:",inline"`
	cachedHTML   template.HTML `yaml:"-"`
	SearchEngine string        `yaml:"search-engine"`
	Bangs        []SearchBang  `yaml:"bangs"`
	NewTab       bool          `yaml:"new-tab"`
	Autofocus    bool          `yaml:"autofocus"`
	SearchIcon   string
}

func convertSearchUrl(url string) string {
	// Go's template is being stubborn and continues to escape the curlies in the
	// URL regardless of what the type of the variable is so this is my way around it
	return strings.ReplaceAll(url, "{QUERY}", "!QUERY!")
}

var searchEngines = map[string]string{
	"duckduckgo": "https://duckduckgo.com/?q={QUERY}",
	"google":     "https://www.google.com/search?q={QUERY}",
}

func (widget *Search) Initialize() error {
	widget.withTitle("Search").withError(nil)
	if widget.SearchEngine == "" {
		widget.SearchEngine = "duckduckgo"
	}

	if url, ok := searchEngines[widget.SearchEngine]; ok {
		widget.SearchEngine = url
	}

	widget.SearchEngine = convertSearchUrl(widget.SearchEngine)

	for i := range widget.Bangs {
		if widget.Bangs[i].Shortcut == "" {
			return fmt.Errorf("Search bang %d has no shortcut", i+1)
		}

		if widget.Bangs[i].URL == "" {
			return fmt.Errorf("Search bang %d has no URL", i+1)
		}

		widget.Bangs[i].URL = convertSearchUrl(widget.Bangs[i].URL)
	}

	widget.cachedHTML = widget.render(widget, assets.SearchTemplate)
	return nil
}

func (widget *Search) Update(ctx context.Context) {
	//searchIcon := widget.Providers.AssetResolver("icons/" + "search1" + ".svg")
	//widget.Providers =
	//widget.cachedHTML = widget.render(widget, assets.SearchTemplate)
}

func (widget *Search) Render() template.HTML {
	widget.SearchIcon = widget.Providers.AssetResolver("icons/" + "search1" + ".svg")
	widget.cachedHTML = widget.render(widget, assets.SearchTemplate)

	return widget.cachedHTML
}

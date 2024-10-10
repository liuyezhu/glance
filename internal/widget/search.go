package widget

import (
	"fmt"
	"github.com/glanceapp/glance/internal/assets"
	"html/template"
	"net/url"
	"reflect"
	"strings"
)

type SearchBang struct {
	Title    string
	Shortcut string
	URL      string
	Icon     string
}

type Search struct {
	widgetBase      `yaml:",inline"`
	cachedHTML      template.HTML `yaml:"-"`
	SearchEngine    string        `yaml:"search-engine"`
	Bangs           []SearchBang  `yaml:"bangs"`
	NewTab          bool          `yaml:"new-tab"`
	Autofocus       bool          `yaml:"autofocus"`
	SearchIcon      string        `yaml:"search-icon"`
	DefaultBangIcon string        `yaml:"default-bang-icon"`
	ClearIcon       string        `yaml:"clear-icon"`
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

	widget.JoinUrl()

	widget.cachedHTML = widget.render(widget, assets.SearchTemplate)
	return nil
}

func (widget *Search) Render() template.HTML {
	widget.cachedHTML = widget.render(widget, assets.SearchTemplate)
	return widget.cachedHTML
}

func (widget *Search) JoinUrl() {

	if !isInterfaceNotNilAndTypeNotNil(widget.Providers) {
		return
	}

	if widget.DefaultBangIcon != "" {
		widget.DefaultBangIcon = widget.Providers.AssetResolver(widget.DefaultBangIcon)
	}

	widget.ClearIcon = widget.Providers.AssetResolver("icons/clear.svg")

	if widget.SearchIcon != "" || !isValidHTTPorHTTPSURL(widget.SearchIcon) {
		widget.SearchIcon = widget.Providers.AssetResolver(widget.SearchIcon)
	}

	for i := range widget.Bangs {
		if isValidHTTPorHTTPSURL(widget.Bangs[i].Icon) {
			continue
		}

		widget.Bangs[i].Icon = widget.Providers.AssetResolver(widget.Bangs[i].Icon)
	}
}

// isInterfaceNotNilAndTypeNotNil 检查接口值是否不为nil，且其底层类型也不为nil
func isInterfaceNotNilAndTypeNotNil(i interface{}) bool {
	if i == nil {
		return false
	}

	value := reflect.ValueOf(i)
	if value.Kind() == reflect.Ptr {
		return !value.IsNil()
	}

	return true
}

func isValidHTTPorHTTPSURL(s string) bool {
	parsedURL, err := url.Parse(s)
	if err != nil {
		return false
	}

	return parsedURL.Scheme == "http" || parsedURL.Scheme == "https"
}

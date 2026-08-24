using Microsoft.AspNetCore.Mvc.RazorPages;

namespace TMVHomePageMobile.Pages;

public class IndexModel : PageModel
{
    public record Slide(string ImageClass, string Alt, string Track, string Artist);

    public List<Slide> Slides { get; } = new()
    {
        new Slide("fan-card__image--studio", "Studio session on a laptop", "Doon Music Festival", "Libro Franklin"),
        new Slide("fan-card__image--crowd", "Crowd at a live concert", "Midnight Skyline", "Ayaan Rhodes"),
        new Slide("fan-card__image--bokeh", "Blurred stage lights", "Golden Hour", "Nova Iyer")
    };

    public void OnGet()
    {
    }
}

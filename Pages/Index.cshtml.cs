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

    // Desktop hero shows 5 scattered cards (see Figma flow 7) instead of
    // the 3-card mobile fan; the center one carries "Doon Music Festival"
    // to match that reference.
    public List<Slide> DesktopSlides { get; } = new()
    {
        new Slide("fan-card__image--reel", "Vintage reel-to-reel deck", "Tape Loop Diaries", "Kabir Mora"),
        new Slide("fan-card__image--neon", "Hand on a synth under neon light", "Neon Strings", "Zoya Kessler"),
        new Slide("fan-card__image--session", "Home studio session with guitars", "Doon Music Festival", "Libro Franklin"),
        new Slide("fan-card__image--sheet", "Handwritten sheet music", "Written In Silence", "Priya Anand"),
        new Slide("fan-card__image--vinyl", "Stack of colorful vinyl records", "Pressed & Spun", "Devraj Oberoi")
    };

    public void OnGet()
    {
    }
}

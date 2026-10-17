namespace TaskManagement.Application.Common.Models;

public class PaginationQuery
{
    private const int MaxPageSize = 50;
    private const int DefaultPageSize = 10;

    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = DefaultPageSize;

    public int NormalizedPage => Page < 1 ? 1 : Page;

    public int NormalizedPageSize => PageSize switch
    {
        < 1 => DefaultPageSize,
        > MaxPageSize => MaxPageSize,
        _ => PageSize
    };

    public int Skip => (NormalizedPage - 1) * NormalizedPageSize;
}

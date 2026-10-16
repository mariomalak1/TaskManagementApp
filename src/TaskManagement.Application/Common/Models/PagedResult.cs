namespace TaskManagement.Application.Common.Models;

public class PagedResult<T>
{
    public IReadOnlyList<T> Data { get; set; } = [];
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
    public int TotalPages { get; set; }

    public static PagedResult<T> Create(IReadOnlyList<T> data, int page, int pageSize, int totalCount)
    {
        return new PagedResult<T>
        {
            Data = data,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = pageSize > 0 ? (int)Math.Ceiling(totalCount / (double)pageSize) : 0
        };
    }
}

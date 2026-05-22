namespace DynamicAdminPanel.Application.Interfaces;

public interface IFileStorageService
{
    Task<string> UploadFileAsync(Stream fileStream, string fileName, string folder = "uploads", CancellationToken cancellationToken = default);
    Task<string> UploadImageAsync(Stream imageStream, string fileName, string folder = "images", CancellationToken cancellationToken = default);
    Task<bool> DeleteFileAsync(string publicId, CancellationToken cancellationToken = default);
    Task<string> GetFileUrlAsync(string publicId, CancellationToken cancellationToken = default);
}

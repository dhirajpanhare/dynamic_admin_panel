using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DynamicAdminPanel.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace DynamicAdminPanel.Infrastructure.Services;

public class CloudinaryFileStorageService : IFileStorageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryFileStorageService(IConfiguration configuration)
    {
        var cloudName = configuration["Cloudinary:CloudName"];
        var apiKey = configuration["Cloudinary:ApiKey"];
        var apiSecret = configuration["Cloudinary:ApiSecret"];

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string folder = "uploads", CancellationToken cancellationToken = default)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, fileStream),
            Folder = folder,
            UseFilename = true,
            UniqueFilename = true
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

        if (uploadResult.Error != null)
        {
            throw new Exception($"File upload failed: {uploadResult.Error.Message}");
        }

        return uploadResult.SecureUrl.ToString();
    }

    public async Task<string> UploadImageAsync(Stream imageStream, string fileName, string folder = "images", CancellationToken cancellationToken = default)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, imageStream),
            Folder = folder,
            UseFilename = true,
            UniqueFilename = true,
            Transformation = new Transformation().Quality("auto").FetchFormat("auto")
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams, cancellationToken);

        if (uploadResult.Error != null)
        {
            throw new Exception($"Image upload failed: {uploadResult.Error.Message}");
        }

        return uploadResult.SecureUrl.ToString();
    }

    public async Task<bool> DeleteFileAsync(string publicId, CancellationToken cancellationToken = default)
    {
        var deletionParams = new DeletionParams(publicId);
        var result = await _cloudinary.DestroyAsync(deletionParams);
        
        return result.Result == "ok";
    }

    public Task<string> GetFileUrlAsync(string publicId, CancellationToken cancellationToken = default)
    {
        var url = _cloudinary.Api.UrlImgUp.BuildUrl(publicId);
        return Task.FromResult(url);
    }
}

using DynamicAdminPanel.Application.Interfaces;
using DynamicAdminPanel.Shared.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DynamicAdminPanel.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class FileController : ControllerBase
{
    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<FileController> _logger;

    public FileController(IFileStorageService fileStorageService, ILogger<FileController> logger)
    {
        _fileStorageService = fileStorageService;
        _logger = logger;
    }

    [HttpPost("upload")]
    public async Task<ActionResult<ApiResponse<FileUploadResponse>>> UploadFile(IFormFile file, [FromQuery] string folder = "uploads")
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<FileUploadResponse>.ErrorResponse("No file provided"));
        }

        using var stream = file.OpenReadStream();
        var url = await _fileStorageService.UploadFileAsync(stream, file.FileName, folder);

        var response = new FileUploadResponse(url, file.FileName, file.Length);
        return Ok(ApiResponse<FileUploadResponse>.SuccessResponse(response, "File uploaded successfully"));
    }

    [HttpPost("upload-image")]
    public async Task<ActionResult<ApiResponse<FileUploadResponse>>> UploadImage(IFormFile file, [FromQuery] string folder = "images")
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(ApiResponse<FileUploadResponse>.ErrorResponse("No file provided"));
        }

        // Validate image file
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        
        if (!allowedExtensions.Contains(extension))
        {
            return BadRequest(ApiResponse<FileUploadResponse>.ErrorResponse("Invalid image format"));
        }

        using var stream = file.OpenReadStream();
        var url = await _fileStorageService.UploadImageAsync(stream, file.FileName, folder);

        var response = new FileUploadResponse(url, file.FileName, file.Length);
        return Ok(ApiResponse<FileUploadResponse>.SuccessResponse(response, "Image uploaded successfully"));
    }

    [HttpDelete("{publicId}")]
    public async Task<ActionResult<ApiResponse<bool>>> DeleteFile(string publicId)
    {
        var result = await _fileStorageService.DeleteFileAsync(publicId);
        return Ok(ApiResponse<bool>.SuccessResponse(result, "File deleted successfully"));
    }
}

public record FileUploadResponse(string Url, string FileName, long FileSize);

using DynamicAdminPanel.Domain.Common;

namespace DynamicAdminPanel.Domain.Entities;

/// <summary>
/// Metadata record for an uploaded file.
/// The actual binary is stored in Cloudinary/S3/Azure Blob;
/// this table tracks the reference URL, uploader, size, and context.
/// </summary>
public class FileRecord : BaseEntity<int>
{
    public int TenantId { get; set; }
    public int? UploadedByUserId { get; set; }

    public string FileName { get; set; } = string.Empty;
    public string OriginalFileName { get; set; } = string.Empty;

    /// <summary>Public URL to access the file</summary>
    public string Url { get; set; } = string.Empty;

    /// <summary>MIME type: "image/jpeg", "application/pdf"</summary>
    public string MimeType { get; set; } = string.Empty;

    /// <summary>File size in bytes</summary>
    public long SizeBytes { get; set; }

    /// <summary>Storage folder/prefix used: "uploads", "avatars", "exports"</summary>
    public string Folder { get; set; } = "uploads";

    /// <summary>Storage provider used: "cloudinary" | "s3" | "azure" | "local"</summary>
    public string StorageProvider { get; set; } = "cloudinary";

    /// <summary>Provider-specific public ID or key for deletion/transform</summary>
    public string? StorageKey { get; set; }

    // Navigation
    public virtual User? UploadedByUser { get; set; }
}

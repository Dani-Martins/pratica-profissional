using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.DTOs
{
    public class MovimentacaoNFEDTO
    {
        public long Id { get; set; }

        [Required(ErrorMessage = "NFE é obrigatória")]
        public long NfeId { get; set; }

        [Required(ErrorMessage = "Data da movimentação é obrigatória")]
        public DateTime DataMovimentacao { get; set; }

        [Required(ErrorMessage = "Status é obrigatório")]
        [StringLength(50, ErrorMessage = "Status deve ter no máximo 50 caracteres")]
        public string Status { get; set; } = string.Empty;

        public string? Descricao { get; set; }

        public NFEDTO? NFE { get; set; }
    }

    public class CreateMovimentacaoNFEDTO
    {
        [Required(ErrorMessage = "NFE é obrigatória")]
        public long NfeId { get; set; }

        [Required(ErrorMessage = "Data da movimentação é obrigatória")]
        public DateTime DataMovimentacao { get; set; }

        [Required(ErrorMessage = "Status é obrigatório")]
        [StringLength(50, ErrorMessage = "Status deve ter no máximo 50 caracteres")]
        public string Status { get; set; } = string.Empty;

        public string? Descricao { get; set; }
    }

    public class UpdateMovimentacaoNFEDTO : CreateMovimentacaoNFEDTO
    {
    }
}
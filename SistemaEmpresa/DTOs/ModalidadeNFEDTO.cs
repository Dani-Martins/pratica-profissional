using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.DTOs
{
    public class ModalidadeNFEDTO
    {
        public long Id { get; set; }

        [Required(ErrorMessage = "Código é obrigatório")]
        public int Codigo { get; set; }

        [Required(ErrorMessage = "Descrição é obrigatória")]
        [StringLength(100, ErrorMessage = "Descrição deve ter no máximo 100 caracteres")]
        public string Descricao { get; set; } = string.Empty;

        public bool Ativo { get; set; }
    }

    public class CreateModalidadeNFEDTO
    {
        [Required(ErrorMessage = "Código é obrigatório")]
        public int Codigo { get; set; }

        [Required(ErrorMessage = "Descrição é obrigatória")]
        [StringLength(100, ErrorMessage = "Descrição deve ter no máximo 100 caracteres")]
        public string Descricao { get; set; } = string.Empty;
    }

    public class UpdateModalidadeNFEDTO : CreateModalidadeNFEDTO
    {
        public bool Ativo { get; set; }
    }
}
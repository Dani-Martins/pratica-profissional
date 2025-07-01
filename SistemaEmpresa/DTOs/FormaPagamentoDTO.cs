using System;
using System.ComponentModel.DataAnnotations;

namespace SistemaEmpresa.DTOs
{
    public class FormaPagamentoDTO
    {
        public long Id { get; set; }
        public string Descricao { get; set; } = string.Empty;
        public byte Situacao { get; set; } // TINYINT(4) no banco = byte no C#
        public DateTime DataCriacao { get; set; }
        public DateTime? DataAlteracao { get; set; }
        public string UserCriacao { get; set; } = string.Empty;
        public string? UserAtualizacao { get; set; }
        
        // Propriedade de compatibilidade com código existente
        public bool Ativo { get => Situacao == 1; set => Situacao = value ? (byte)1 : (byte)0; }
    }

    public class FormaPagamentoCreateDTO
    {
        public string Descricao { get; set; } = string.Empty;
        public byte Situacao { get; set; } = 1; // 1 = ativo
        public string UserCriacao { get; set; } = "Sistema";
    }

    public class FormaPagamentoUpdateDTO
    {
        public string Descricao { get; set; } = string.Empty;
        public byte Situacao { get; set; } = 1; // 1 = ativo
        public string? UserAtualizacao { get; set; }
    }
}
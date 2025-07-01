using MySqlConnector;
using SistemaEmpresa.Models;
using System.Data;

namespace SistemaEmpresa.Repositories
{
    public class NFERepository
    {
        private readonly MySqlConnection _connection;

        public NFERepository(MySqlConnection connection)
        {
            _connection = connection;
        }

        public async Task<IEnumerable<NFE>> ReadAll()
        {
            var nfes = new List<NFE>();
            
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT n.*, 
                           m.descricao as modalidade_descricao,
                           t.razao_social as transportadora_razao_social
                    FROM nfe n
                    LEFT JOIN modalidade_nfe m ON n.modalidade_id = m.id
                    LEFT JOIN transportadora t ON n.transportadora_id = t.id
                    ORDER BY n.id", _connection);
                    
                using var reader = await command.ExecuteReaderAsync();
                
                while (await reader.ReadAsync())
                {
                    nfes.Add(MapearNFE(reader));
                }
                
                return nfes;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<NFE?> ReadById(long id)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT n.*, 
                           e.razao_social as emitente_razao_social,
                           d.razao_social as destinatario_razao_social,
                           t.razao_social as transportadora_razao_social,
                           m.descricao as modalidade_descricao
                    FROM nfe n
                    LEFT JOIN emitente e ON n.emitente_id = e.id
                    LEFT JOIN destinatario d ON n.destinatario_id = d.id
                    LEFT JOIN transportadora t ON n.transportadora_id = t.id
                    LEFT JOIN modalidade_nfe m ON n.modalidade_id = m.id
                    WHERE n.id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    return MapearNFE(reader);
                }
                
                return null;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<NFE?> ReadByNumero(string numero)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(@"
                    SELECT n.*, 
                           e.razao_social as emitente_razao_social,
                           d.razao_social as destinatario_razao_social,
                           t.razao_social as transportadora_razao_social,
                           m.descricao as modalidade_descricao
                    FROM nfe n
                    LEFT JOIN emitente e ON n.emitente_id = e.id
                    LEFT JOIN destinatario d ON n.destinatario_id = d.id
                    LEFT JOIN transportadora t ON n.transportadora_id = t.id
                    LEFT JOIN modalidade_nfe m ON n.modalidade_id = m.id
                    WHERE n.numero = @numero", _connection);
                
                command.Parameters.AddWithValue("@numero", numero);
                
                using var reader = await command.ExecuteReaderAsync();
                
                if (await reader.ReadAsync())
                {
                    return MapearNFE(reader);
                }
                
                return null;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Create(NFE nfe)
        {
            try
            {
                await _connection.OpenAsync();

                // Validações de existência
                await ValidarDependencias(nfe);

                using var command = new MySqlCommand(@"
                    INSERT INTO nfe (
                        numero, serie, data_emissao,
                        valor_total, 
                        observacoes, emitente_id, destinatario_id,
                        transportadora_id, modalidade_id
                    ) VALUES (
                        @numero, @serie, @dataEmissao,
                        @valorTotal, 
                        @observacoes, @emitenteId, @destinatarioId,
                        @transportadoraId, @modalidadeId
                    )", _connection);
                
                PreencherParametros(command, nfe);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Update(long id, NFE nfe)
        {
            try
            {
                await _connection.OpenAsync();

                // Validações de existência
                await ValidarDependencias(nfe);

                using var command = new MySqlCommand(@"
                    UPDATE nfe 
                    SET numero = @numero,
                        serie = @serie,
                        data_emissao = @dataEmissao,
                        valor_total = @valorTotal,
                        observacoes = @observacoes,
                        emitente_id = @emitenteId,
                        destinatario_id = @destinatarioId,
                        transportadora_id = @transportadoraId,
                        modalidade_id = @modalidadeId
                    WHERE id = @id", _connection);
                
                command.Parameters.AddWithValue("@id", id);
                PreencherParametros(command, nfe);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        public async Task<bool> Delete(long id)
        {
            try
            {
                await _connection.OpenAsync();
                
                using var command = new MySqlCommand(
                    "UPDATE nfe SET status = 'CANCELADA' WHERE id = @id", 
                    _connection);
                
                command.Parameters.AddWithValue("@id", id);
                
                return await command.ExecuteNonQueryAsync() > 0;
            }
            finally
            {
                if (_connection.State == ConnectionState.Open)
                    await _connection.CloseAsync();
            }
        }

        private async Task ValidarDependencias(NFE nfe)
        {
            // Verifica se o emitente existe
            using (var checkEmitente = new MySqlCommand(
                "SELECT COUNT(*) FROM emitente WHERE id = @emitenteId", 
                _connection))
            {
                checkEmitente.Parameters.AddWithValue("@emitenteId", nfe.EmitenteId);
                if (Convert.ToInt32(await checkEmitente.ExecuteScalarAsync()) == 0)
                    throw new InvalidOperationException($"Emitente com ID {nfe.EmitenteId} não encontrado");
            }

            // Verifica se o destinatário existe
            using (var checkDestinatario = new MySqlCommand(
                "SELECT COUNT(*) FROM destinatario WHERE id = @destinatarioId", 
                _connection))
            {
                checkDestinatario.Parameters.AddWithValue("@destinatarioId", nfe.DestinatarioId);
                if (Convert.ToInt32(await checkDestinatario.ExecuteScalarAsync()) == 0)
                    throw new InvalidOperationException($"Destinatário com ID {nfe.DestinatarioId} não encontrado");
            }

            // Verifica se a transportadora existe (se fornecida)
            if (nfe.TransportadoraId.HasValue)
            {
                using var checkTransportadora = new MySqlCommand(
                    "SELECT COUNT(*) FROM transportadora WHERE id = @transportadoraId AND ativo = 1", 
                    _connection);
                
                checkTransportadora.Parameters.AddWithValue("@transportadoraId", nfe.TransportadoraId.Value);
                if (Convert.ToInt32(await checkTransportadora.ExecuteScalarAsync()) == 0)
                    throw new InvalidOperationException($"Transportadora com ID {nfe.TransportadoraId} não encontrada ou inativa");
            }

            // Verifica se a modalidade existe
            using (var checkModalidade = new MySqlCommand(
                "SELECT COUNT(*) FROM modalidade_nfe WHERE id = @modalidadeId", 
                _connection))
            {
                checkModalidade.Parameters.AddWithValue("@modalidadeId", nfe.ModalidadeId);
                if (Convert.ToInt32(await checkModalidade.ExecuteScalarAsync()) == 0)
                    throw new InvalidOperationException($"Modalidade com ID {nfe.ModalidadeId} não encontrada");
            }
        }

        private void PreencherParametros(MySqlCommand command, NFE nfe)
        {
            command.Parameters.AddWithValue("@numero", nfe.Numero);
            command.Parameters.AddWithValue("@serie", nfe.Serie);
            command.Parameters.AddWithValue("@dataEmissao", nfe.DataEmissao);
            command.Parameters.AddWithValue("@valorTotal", nfe.ValorTotal);
            command.Parameters.AddWithValue("@transportadoraId", 
                nfe.TransportadoraId.HasValue ? nfe.TransportadoraId.Value : (object)DBNull.Value);
            command.Parameters.AddWithValue("@modalidadeId", nfe.ModalidadeId);
        }

        private NFE MapearNFE(MySqlDataReader reader)
        {
            return new NFE
            {
                Id = reader.GetInt64("id"),
                Numero = reader.GetString("numero"),
                Serie = reader.GetString("serie"),
                DataEmissao = reader.GetDateTime("data_emissao"),
                ValorTotal = reader.GetDecimal("valor_total"),
                ValorProdutos = 0,
                ValorFrete = 0,
                TransportadoraId = reader.IsDBNull(reader.GetOrdinal("transportadora_id")) 
                    ? null 
                    : reader.GetInt64("transportadora_id"),
                ModalidadeId = reader.GetInt64("modalidade_id"),
                Status = "PENDENTE",
                Transportadora = !reader.IsDBNull(reader.GetOrdinal("transportadora_id"))
                    ? new Transportadora { Id = (int)reader.GetInt64("transportadora_id"), RazaoSocial = reader.GetString("transportadora_razao_social") }
                    : null,
                Modalidade = new ModalidadeNFE { Id = reader.GetInt64("modalidade_id"), Descricao = reader.GetString("modalidade_descricao") },
                ClienteId = (int)reader.GetInt64("cliente_id")
            };
        }
    }
}

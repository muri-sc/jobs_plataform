/** Monta mensagem amigável a partir de error / details da API. */
export function formatApiError(err) {
  if (!err) return 'Algo deu errado. Tente novamente.';

  const lines = [err.message || 'Erro inesperado'];

  if (Array.isArray(err.details) && err.details.length > 0) {
    err.details.forEach((item) => {
      const field = item.field ? `${item.field}: ` : '';
      lines.push(`${field}${item.message}`);
    });
  }

  return lines.join('\n');
}

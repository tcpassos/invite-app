/** A recusa de um campo, com o id que o campo aponta em aria-describedby. */
export function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} className="field-error">
      {message}
    </p>
  );
}

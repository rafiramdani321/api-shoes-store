export const validationResponses = (errors: any) => {
  const errorValidation = errors.error.issues.map(
    (issue: { path: string; message: string }) => ({
      field: String(issue.path[0]),
      message: issue.message,
    })
  );
  return errorValidation;
};

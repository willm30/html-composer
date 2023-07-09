export enum ErrorTypes {
    InvalidExtn = "INVALID_EXTENSION",
    InfiniteCycle = "INFINITE_CYCLE",
    FileNotFound = "FILE_NOT_FOUND",
  }
  
  const errorMessages = {
    [ErrorTypes.InvalidExtn]: ({ extn, cwd }: { extn: string; cwd: string }) =>
      `Unable to compose file with extension: ${extn} at ${cwd}. Ensure all imported file names end with ".html". `,
    [ErrorTypes.InfiniteCycle]: ({
      resolvedPath,
      toPath,
      previouslyResolvedAt,
    }: {
      resolvedPath: string;
      toPath: string;
      previouslyResolvedAt: string;
    }) =>
      `Infinite cycle detected. You are attempting to import ${resolvedPath} from ${toPath}, however, it has already been imported from ${previouslyResolvedAt}, which is resulting in a infinite loop.`,
    [ErrorTypes.FileNotFound]: ({toPath, originalError}: {toPath: string, originalError: string}) => `You are attempting to open a file at ${toPath} which cannot be opened because: ${originalError}.`,
  };
  
  
  
  export class ErrorReporter {
    public throwError(e: ErrorTypes, data: object) {
      throw new Error(this.generateErrorMessage(e, data));
    }
  
    private generateErrorMessage(e: ErrorTypes, data: any) {
      switch (e) {
        case ErrorTypes.InvalidExtn: {
          return errorMessages[ErrorTypes.InvalidExtn](data);
        }
  
        case ErrorTypes.InfiniteCycle: {
          return errorMessages[ErrorTypes.InfiniteCycle](data);
        }
  
        case ErrorTypes.FileNotFound: {
          return errorMessages[ErrorTypes.FileNotFound](data);
        }
  
        default: {
          return `Unknown Error: ${e}.`
        }
      }
    }
  }
  
import {
  SaveFileRequest,
  SaveFileResponse
} from '@common/http/file/save.file';
import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import {FileInterceptor} from "@nestjs/platform-express";
import {AuthGuard} from "@/modules/app/guards/auth.guard";
import {UserId} from "@/modules/app/decorators/user.id.decorator";
import {FileService} from "@/modules/api/file/file.service";

@Controller({
  path: "/api/file",
})
export class FileController {
  public constructor(
    private readonly fileService: FileService,
  ) {
  }

  @UseGuards(AuthGuard)
  @Post("/upload-file")
  @UseInterceptors(FileInterceptor("file"))
  public async acceptToken(
    @UploadedFile() file: Express.Multer.File,
      @Body() body: SaveFileRequest,
      @UserId() userId: number,
  ): Promise<SaveFileResponse> {
    return this.fileService.saveFile(userId, file, body.symbol, body.type, body.name);
  }
}
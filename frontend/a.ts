  public async readCsv(): Promise<string> {
    let data: Buffer;

    try {
      await this.sftp.connect(this.config);
      const file = await this.lastModifiedFileOnServer();
      data = (await this.sftp.get(`${this.pathToFolder}/${file}`)) as Buffer;
      return data.toString();
    } finally {
      await this.sftp.end();
    }
  }

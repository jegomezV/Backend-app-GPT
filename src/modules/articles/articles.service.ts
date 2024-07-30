import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { load } from 'cheerio';

@Injectable()
export class ArticleService {
  constructor(
    private readonly httpService: HttpService
  ) {}

  async getArticle(url: string): Promise<{ title: string; body: string } | null> {
    try {
      const response = await lastValueFrom(this.httpService.get(url));
      const html = response.data;

      const $ = load(html);

      const title = $("h1").text().trim();
      const paragraphs = $("p").text().trim();
      const headers = $("h1, h2, h3, h4, h5, h6").text().trim();
      const lists = $("li").text().trim();
      return { title, body: `${headers}\n\n${paragraphs}\n\n${lists}` };
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}

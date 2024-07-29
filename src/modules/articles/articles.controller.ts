import { Controller, Get } from '@nestjs/common';
import { ArticleService } from './articles.service';
import { Article } from './entity/article.entity';


@Controller('')
export class ArticlesController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('/articles')
  async getAllArticles(): Promise<Article[]> {
    console.log('Get all articles');
    const articles = await this.articleService.getArticles();
    console.log(`Estos son los articulos: ${articles}`);
    return articles;
  }
}

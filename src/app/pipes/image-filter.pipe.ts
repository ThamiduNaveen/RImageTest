import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'imageFilter'
})
export class ImageFilterPipe implements PipeTransform {

  transform(images: {
    id: string,
    title: string,
    url: string,
    src: string
  }[], searchText: string): any {
    if (searchText.trim()) {
      return images.filter(image => image.title.startsWith(searchText.trim()));
    }else{
      return images
    }
  }

}

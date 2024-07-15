import { AfterViewInit, Component, ElementRef,Input,ViewChild } from '@angular/core';

@Component({
  selector: 'app-slider-step',
  templateUrl: './slider-step.component.html',
  styleUrl: './slider-step.component.scss'
})
export class SliderStepComponent implements AfterViewInit {
  
  @ViewChild('stepRange', {static:false}) el: ElementRef
  @Input() step:number//This value is not aviable at production.

  private createStepMarkers(min: number, max: number, step: number): void {
    const numberOfSteps = (max - min) / step;
    const slider = this.el.nativeElement.querySelector('.p-slider');
    
    for (let i = 0; i <= numberOfSteps; i++) {
      const marker = document.createElement('div');
      marker.classList.add('step-marker');
      marker.style.position = 'absolute';
      const position = (i * step / (max - min)) * 100;
      if(position === 0) marker.style.left = '0.143rem'//Half of the marker width
      if(position === 100) marker.style.left = 'calc(100% - 0.143rem)'
      if(position !== 0 && position !== 100) marker.style.left = `${position}%`;
      
      slider.appendChild(marker);
    }
  }
  
  ngAfterViewInit(): void {
    const sliderElement:HTMLElement = this.el.nativeElement.querySelector('[role="slider"]');

    if (sliderElement) {
      const minValue = parseInt(sliderElement.getAttribute('aria-valuemin'), 10);
      const maxValue = parseInt(sliderElement.getAttribute('aria-valuemax'), 10);
      
      this.createStepMarkers(minValue, maxValue, this.step);
    }
  }

}

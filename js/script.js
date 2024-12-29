 //--------------- прокручивается при клике

      document.addEventListener("DOMContentLoaded", () => {
        const slidesContainer = document.querySelector(".slides"); // Лента слайдов
        const slideElements = document.querySelectorAll(".slide"); // Все слайды
        const prevButton = document.getElementById("prev"); // Кнопка "назад"
        const nextButton = document.getElementById("next"); // Кнопка "вперед"
        const dots = document.querySelectorAll(".dot"); // Точки управления
        const popupOverlay = document.getElementById("popup-overlay"); // Оверлей попапа
        const popupDescription = document.getElementById("popup-description"); // Текст описания попапа
        const popupClose = document.getElementById("popup-close"); // Кнопка закрытия попапа
        const popup = document.getElementById("popup");

        const slideWidth = 300; // Ширина одного слайда
        const gap = 37.33; // Отступ между слайдами
        const visibleSlides = 4; // Количество видимых слайдов
        const totalSlides = slideElements.length; // Всего слайдов
        const maxIndex = totalSlides - visibleSlides; // Максимальный индекс для слайдов

        let currentIndex = 0; // Текущий индекс видимого слайда
        let isDragging = false; // Флаг перетаскивания
        let isPopupOpen = false; // Флаг активности попапа
        let autoplayInterval = null; // Интервал автопроигрывания

        let startX = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;

        

        // Отключаем перетаскивание изображений
        slideElements.forEach((slide) => {
          const img = slide.querySelector("img");
          if (img) {
            img.addEventListener("dragstart", (event) =>
              event.preventDefault()
            );
          }
        });

        // Обновление позиции слайдов
        function updateSlidePosition() {
          if (isPopupOpen) return; // Блокируем изменение позиции, если попап открыт
          const offset = -currentIndex * (slideWidth + gap);
          slidesContainer.style.transform = `translateX(${offset}px)`;
          slidesContainer.style.transition = "transform 0.3s ease-in-out";
          updateDots();
        }

        // Обновление активной точки
        function updateDots() {
          dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === currentIndex);
          });
        }

        // Автопрокрутка
        function startAutoplay() {
          if (autoplayInterval || isPopupOpen) return; // Не запускаем автопрокрутку, если уже запущена или попап открыт
          autoplayInterval = setInterval(() => {
            if (currentIndex < maxIndex) {
              currentIndex++;
            } else {
              currentIndex = 0; // Возврат к первому слайду
            }
            updateSlidePosition();
          }, 3000);
        }

        function stopAutoplay() {
          if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
          }
        }

        // Начало перетаскивания
        function startDragging(event) {
          if (isPopupOpen) return; // Отключаем перетаскивание, если попап активен
          isDragging = true;
          startX =
            event.type === "touchstart"
              ? event.touches[0].clientX
              : event.clientX;
          prevTranslate = -currentIndex * (slideWidth + gap);
          slidesContainer.style.transition = "none";
          stopAutoplay();
        }

        // Перетаскивание
        function dragging(event) {
          if (!isDragging || isPopupOpen) return; // Отключаем перетаскивание, если попап активен
          const currentX =
            event.type === "touchmove"
              ? event.touches[0].clientX
              : event.clientX;
          const deltaX = currentX - startX;
          currentTranslate = prevTranslate + deltaX;
          slidesContainer.style.transform = `translateX(${currentTranslate}px)`;
        }

        // Завершение перетаскивания
        function stopDragging() {
          if (!isDragging) return;
          isDragging = false;

          const offsetPerSlide = slideWidth + gap;
          currentIndex = Math.round(-currentTranslate / offsetPerSlide);
          currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));
          updateSlidePosition();
          startAutoplay();
        }

        // События для кнопок
        prevButton.addEventListener("click", () => {
          if (isPopupOpen) return; // Отключаем кнопки, если попап активен
          stopAutoplay();
          if (currentIndex > 0) {
            currentIndex--;
            updateSlidePosition();
          }
        });

        nextButton.addEventListener("click", () => {
          if (isPopupOpen) return; // Отключаем кнопки, если попап активен
          stopAutoplay();
          if (currentIndex < maxIndex) {
            currentIndex++;
            updateSlidePosition();
          }
        });

        // Точки навигации
        dots.forEach((dot, index) => {
          dot.addEventListener("click", () => {
            if (isPopupOpen) return; // Отключаем точки, если попап активен
            stopAutoplay();
            currentIndex = index;
            updateSlidePosition();
          });
        });

        // Попап при клике на слайд
        slideElements.forEach((slide) => {
          slide.addEventListener("click", (event) => {
            if (isDragging) return; // Игнорируем клик, если было перетаскивание
            const description =
              slide.dataset.description || "Описание отсутствует";
            popupDescription.textContent = description;
            popupOverlay.style.display = "block";
            popup.style.display = "block";
            isPopupOpen = true; // Устанавливаем флаг активности попапа
            stopAutoplay(); // Останавливаем автопроигрывание при открытии попапа
          });
        });

        // Закрытие попапа
        function closePopup() {
          popupOverlay.style.display = "none";
          popup.style.display = "none";
          isPopupOpen = false; // Сбрасываем флаг активности попапа
          startAutoplay(); // Возобновляем автопроигрывание после закрытия
        }

        popupClose.addEventListener("click", closePopup);
        popupOverlay.addEventListener("click", closePopup);

        // Закрытие попапа по клавише ESC
        document.addEventListener("keydown", (event) => {
          if (isPopupOpen && event.key === "Escape") {
            closePopup();
          }
        });

        // Наведение мыши для остановки автопрокрутки
        slidesContainer.addEventListener("mouseenter", stopAutoplay);
        slidesContainer.addEventListener("mouseleave", startAutoplay);

        // События для мыши
        slidesContainer.addEventListener("mousedown", startDragging);
        slidesContainer.addEventListener("mousemove", dragging);
        window.addEventListener("mouseup", stopDragging);

        // События для сенсорных экранов
        slidesContainer.addEventListener("touchstart", startDragging);
        slidesContainer.addEventListener("touchmove", dragging);
        slidesContainer.addEventListener("touchend", stopDragging);

        // Инициализация
        updateSlidePosition();
        startAutoplay();
      });
     
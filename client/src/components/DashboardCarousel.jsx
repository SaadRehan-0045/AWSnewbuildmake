// components/DashboardCarousel.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Paper, Box, Typography, styled, IconButton, useMediaQuery, useTheme } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';

// Import your local images
import image1 from './deathnote.jpg';
import image2 from './all2.jpg';
import image3 from './3.jpg';
import image4 from './PyVZwSt.png';
import image5 from './naruto.jpg';
import image6 from './all3.jpg';
import image7 from './all.jpg';

// Use styled from @mui/material instead of makeStyles
const CarouselContainer = styled(Box)(({ theme }) => ({
  margin: '16px 0',
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  position: 'relative',
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    margin: '20px 0',
  },
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  position: 'relative',
  textAlign: 'center',
  backgroundColor: '#f5f5f5',
  height: '280px', // Mobile first height
  overflow: 'hidden',
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    height: '350px',
  },
  [theme.breakpoints.up('md')]: {
    height: '450px',
  },
  [theme.breakpoints.up('lg')]: {
    height: '500px',
  },
}));

const ImageContainer = styled(Box)({
  position: 'relative',
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: '#000',
});

const CarouselImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'opacity 0.5s ease',
});

const ContentOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '0',
  left: 0,
  right: 0,
  padding: '12px 16px',
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  color: 'white',
  textAlign: 'center',
  backdropFilter: 'blur(5px)',
  // Add bottom padding to create space for indicators
  paddingBottom: theme.spacing(6), // Increased bottom padding for mobile
  [theme.breakpoints.up('sm')]: {
    padding: '20px 25px',
    bottom: '20px',
    paddingBottom: '20px', // Reset for larger screens
  },
  [theme.breakpoints.up('md')]: {
    padding: '25px',
    bottom: '40px',
    paddingBottom: '25px',
  },
}));

const NavigationButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  transform: 'translateY(-50%)',
  backgroundColor: 'rgba(0,0,0,0.5)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  zIndex: 100,
  width: '32px',
  height: '32px',
  [theme.breakpoints.up('sm')]: {
    width: '40px',
    height: '40px',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '20px',
    [theme.breakpoints.up('sm')]: {
      fontSize: '24px',
    },
  },
}));

const PrevButton = styled(NavigationButton)(({ theme }) => ({
  left: '8px',
  [theme.breakpoints.up('sm')]: {
    left: '10px',
  },
}));

const NextButton = styled(NavigationButton)(({ theme }) => ({
  right: '8px',
  [theme.breakpoints.up('sm')]: {
    right: '10px',
  },
}));

const IndicatorsContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: '12px', // Increased from 8px
  left: 0,
  right: 0,
  display: 'flex',
  justifyContent: 'center',
  gap: '4px',
  zIndex: 101, // Increased z-index to be above content
  padding: '0 16px', // Add horizontal padding
  [theme.breakpoints.up('sm')]: {
    bottom: '20px', // Increased from 12px
    gap: '6px',
  },
  [theme.breakpoints.up('md')]: {
    bottom: '30px', // Increased from 20px
    gap: '8px',
  },
}));

const IndicatorButton = styled(IconButton)(({ theme }) => ({
  color: '#ccc',
  padding: '4px',
  width: '24px',
  height: '24px',
  backgroundColor: 'rgba(0, 0, 0, 0.3)', // Add background for better visibility
  backdropFilter: 'blur(5px)',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  '&.active': {
    color: '#1976d2',
    transform: 'scale(1.2)',
    backgroundColor: 'rgba(25, 118, 210, 0.2)',
  },
  [theme.breakpoints.up('sm')]: {
    padding: '5px',
    width: '28px',
    height: '28px',
    '&.active': {
      transform: 'scale(1.3)',
    },
  },
  '& .MuiSvgIcon-root': {
    fontSize: '14px', // Slightly smaller for mobile
    [theme.breakpoints.up('sm')]: {
      fontSize: '18px',
    },
  },
}));

// Fallback image in case imported images don't load
const fallbackImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iIzMzMyIvPgogIDx0ZXh0IHg9IjQwMCIgeT0iMzAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IiM4ODgiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkFuaW1lIEltYWdlPC90ZXh0Pgo8L3N2Zz4=';

const DashboardCarousel = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  // All 7 carousel items with images
  const carouselItems = [
    {
      img: image1,
      name: "Best Collection",
      description: "Explore the fascinating series",
    },
    {
      img: image2,
      name: "Anime Gallery",
      description: "Discover stunning anime series",
    },
    {
      img: image3,
      name: "Latest Releases",
      description: "Check out the newest anime series and movies",
    },
    {
      img: image4,
      name: "Character Profiles",
      description: "Learn about your favorite anime characters",
    },
    {
      img: image5,
      name: "Fighting Universe",
      description: "Dive into the world of Fighting Universe and its adventures",
    },
    {
      img: image6,
      name: "Community Hub",
      description: "Join discussions with fellow anime enthusiasts",
    },
    {
      img: image7,
      name: "Character Profiles",
      description: "Learn about your favorite anime characters",
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Handle image load
  const handleImageLoad = (index) => {
    setLoadedImages(prev => ({ ...prev, [index]: true }));
  };

  // Handle image loading errors
  const handleImageError = (e, itemIndex) => {
    console.warn(`Image failed to load for item ${itemIndex}, using fallback`);
    e.target.src = fallbackImage;
  };

  // Go to next slide - wrapped with useCallback to prevent recreation on every render
  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === carouselItems.length - 1 ? 0 : prevIndex + 1
    );
  }, [carouselItems.length]);

  // Go to previous slide
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? carouselItems.length - 1 : prevIndex - 1
    );
  };

  // Go to specific slide
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Auto-play functionality with responsive timing
  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      const intervalTime = isMobile ? 3000 : 2500;
      interval = setInterval(() => {
        nextSlide();
      }, intervalTime);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, isMobile]);

  // Pause auto-play when user interacts with carousel
  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  // Touch swipe functionality for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <CarouselContainer 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <StyledPaper elevation={6}>
        {carouselItems.map((item, index) => (
          <CarouselItem 
            key={index}
            item={item} 
            index={index} 
            onImageError={handleImageError}
            onImageLoad={handleImageLoad}
            isLoaded={loadedImages[index] || false}
            isActive={index === currentIndex}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        ))}
        
        <PrevButton onClick={prevSlide} aria-label="Previous slide">
          <NavigateBeforeIcon />
        </PrevButton>
        
        <NextButton onClick={nextSlide} aria-label="Next slide">
          <NavigateNextIcon />
        </NextButton>
        
        <IndicatorsContainer>
          {carouselItems.map((_, index) => (
            <IndicatorButton
              key={index}
              onClick={() => goToSlide(index)}
              className={index === currentIndex ? 'active' : ''}
              aria-label={`Go to slide ${index + 1}`}
            >
              {index === currentIndex ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon />}
            </IndicatorButton>
          ))}
        </IndicatorsContainer>
      </StyledPaper>
    </CarouselContainer>
  );
};

// Separate component for carousel items
const CarouselItem = React.memo(({ item, index, onImageError, onImageLoad, isLoaded, isActive, isMobile, isTablet }) => {
  return (
    <ImageContainer
      style={{
        display: isActive ? 'flex' : 'none',
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out'
      }}
    >
      <CarouselImage 
        src={item.img} 
        alt={item.name} 
        onError={(e) => onImageError(e, index)}
        onLoad={() => onImageLoad(index)}
        loading={index === 0 ? "eager" : "lazy"}
      />
      <ContentOverlay>
        <Typography 
          variant={isMobile ? "h5" : isTablet ? "h4" : "h3"} 
          component="h2" 
          gutterBottom 
          sx={{ 
            fontWeight: 'bold', 
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
            marginBottom: isMobile ? '8px' : '15px',
            fontSize: isMobile ? '1.3rem' : isTablet ? '1.8rem' : '2.2rem', // Slightly smaller for mobile
            lineHeight: 1.2
          }}
        >
          {item.name}
        </Typography>
        <Typography 
          variant={isMobile ? "body2" : "h6"} 
          component="p" 
          sx={{ 
            textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            lineHeight: '1.4',
            fontSize: isMobile ? '0.8rem' : '0.9rem', // Smaller font for better fit
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            maxHeight: isMobile ? '2.8em' : '3em', // Limit height
          }}
        >
          {item.description}
        </Typography>
      </ContentOverlay>
    </ImageContainer>
  );
});

export default DashboardCarousel;
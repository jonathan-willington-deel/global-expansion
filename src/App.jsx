import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import { Button } from './components/ui/button'
import TopNav from './components/TopNav'

import { AlertTriangle, TrendingUp, Users, Building2, DollarSign, MapPin } from 'lucide-react'
import Flag from './components/Flag'
import Chevron from './components/Chevron'
import './App.css'

function App() {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const [mapData, setMapData] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [activeView, setActiveView] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState({})
  const [highlightedGroup, setHighlightedGroup] = useState(null)
  const [expandedAccordions, setExpandedAccordions] = useState({})
  const [selectedComplianceArticle, setSelectedComplianceArticle] = useState(null)

  // Debug: Log that the App component is rendering
  console.log('App component rendering, loading:', loading, 'mapData:', !!mapData)
  console.log('App component state:', { loading, mapData: !!mapData, mapLoaded, selectedCountry })

  // Country coordinates for pins
  const countryCoordinates = {
    'United States': [-98.5795, 39.8283],
    'Netherlands': [5.2913, 52.1326],
    'Germany': [10.4515, 51.1657],
    'India': [78.9629, 20.5937],
    'Poland': [19.1342, 51.9194],
    'Bulgaria': [25.4858, 42.7339],
    'Philippines': [121.7740, 12.8797],
    'Vietnam': [108.2772, 14.0583],
    'Paraguay': [-58.4438, -23.4425],
    'Argentina': [-63.6167, -38.4161],
    'South Africa': [24.9916, -30.5595]
  }

  // Country zoom levels based on size (larger countries = lower zoom)
  const countryZoomLevels = {
    'United States': 3,    // Very large country
    'India': 3,           // Very large country
    'Argentina': 3,       // Large country
    'South Africa': 3,    // Large country
    'Germany': 4,         // Medium-large country
    'Poland': 4,          // Medium country
    'Bulgaria': 4,        // Medium country
    'Vietnam': 4,         // Medium country
    'Philippines': 4,     // Medium country
    'Paraguay': 4,        // Medium country
    'Netherlands': 5      // Small country
  }

  useEffect(() => {
    // Load map data only once
    if (mapData) return
    
    setLoading(true)
    console.log('Starting to fetch map data...')
    
    fetch('/global-expansion/map.json')
      .then(response => {
        console.log('Fetch response status:', response.status)
        return response.json()
      })
      .then(data => {
        console.log('Received data:', data)
        console.log('Country groupings:', data.map_data)
        if (data.map_data) {
          Object.keys(data.map_data).forEach(key => {
            console.log(`${key}:`, data.map_data[key])
          })
        }
        setMapData(data)
        setLoading(false)
      })
      .catch(error => {
        console.error('Error loading map data:', error)
        setMapData(null)
        setLoading(false)
      })
  }, [mapData])

  useEffect(() => {
    console.log('Map effect running, map.current:', map.current, 'container:', mapContainer.current, 'mapData:', !!mapData)
    
    if (map.current) {
      console.log('Map already initialized')
      return
    }

    // Wait for both container and data to be available
    if (!mapContainer.current || !mapData) {
      console.log('Map container or data not ready yet')
      return
    }

    // Add a small delay to ensure layout is settled after TopNav
    setTimeout(() => {
      if (!map.current && mapContainer.current && mapData) {
        initializeMap()
      }
    }, 100)
  }, [mapData])

  // Update map highlighting when highlightedGroup changes
  useEffect(() => {
    if (!map.current || !mapData?.map_data) return
    
    const updateMapHighlighting = () => {
      // Get all countries that should be highlighted
      const highlightedCountries = highlightedGroup && mapData.map_data[highlightedGroup] 
        ? mapData.map_data[highlightedGroup].countries?.map(c => c.country) || []
        : []
      
      // Update the map layer with new highlighting logic
      try {
        if (map.current.getLayer('country-fill')) {
          map.current.removeLayer('country-fill')
        }
        
        // Re-add the layer with updated highlighting
        map.current.addLayer({
          id: 'country-fill',
          type: 'fill',
          source: 'countries',
          'source-layer': 'country_boundaries',
          paint: {
            'fill-color': [
              'case',
              // Apply category-specific hover colors when hovered
              ['all',
                ['boolean', ['feature-state', 'hover'], false],
                ['any',
                  ['==', ['get', 'name_en'], 'United States'],
                  ['==', ['get', 'name_en'], 'Netherlands'],
                  ['==', ['get', 'name_en'], 'Germany']
                ]
              ],
              '#d1451b', // Darker orange for CRITICAL hover
              ['all',
                ['boolean', ['feature-state', 'hover'], false],
                ['==', ['get', 'name_en'], 'India']
              ],
              '#16a34a', // Darker green for GROWTH hover
              ['all',
                ['boolean', ['feature-state', 'hover'], false],
                ['==', ['get', 'name_en'], 'Philippines']
              ],
              '#2563eb', // Darker blue for OPPORTUNITY hover
              ['all',
                ['boolean', ['feature-state', 'hover'], false],
                ['any',
                  ['==', ['get', 'name_en'], 'Paraguay'],
                  ['==', ['get', 'name_en'], 'Argentina']
                ]
              ],
              '#7c3aed', // Darker purple for COMPENSATION_MANAGEMENT hover
              [
                'case',
                // When highlighting is active, show grey for non-highlighted countries
                ...(highlightedCountries.length > 0 ? [
                  // CRITICAL countries
                  ['==', ['get', 'name_en'], 'United States'], 
                  highlightedCountries.includes('United States') ? '#ed5e2a' : '#9ca3af',
                  ['==', ['get', 'name_en'], 'Netherlands'], 
                  highlightedCountries.includes('Netherlands') ? '#ed5e2a' : '#9ca3af',
                  ['==', ['get', 'name_en'], 'Germany'], 
                  highlightedCountries.includes('Germany') ? '#ed5e2a' : '#9ca3af',
                  // GROWTH countries
                  ['==', ['get', 'name_en'], 'India'], 
                  highlightedCountries.includes('India') ? '#22c55e' : '#9ca3af',
                  ['==', ['get', 'name_en'], 'Poland'], 
                  highlightedCountries.includes('Poland') ? '#22c55e' : '#9ca3af',
                  ['==', ['get', 'name_en'], 'Bulgaria'], 
                  highlightedCountries.includes('Bulgaria') ? '#22c55e' : '#9ca3af',
                  // OPPORTUNITY countries
                  ['==', ['get', 'name_en'], 'Philippines'], 
                  highlightedCountries.includes('Philippines') ? '#3b82f6' : '#9ca3af',
                  ['==', ['get', 'name_en'], 'Vietnam'], 
                  highlightedCountries.includes('Vietnam') ? '#3b82f6' : '#9ca3af',
                  // COMPENSATION_MANAGEMENT countries
                  ['==', ['get', 'name_en'], 'Paraguay'], 
                  highlightedCountries.includes('Paraguay') ? '#8b5cf6' : '#9ca3af',
                  ['==', ['get', 'name_en'], 'Argentina'], 
                  highlightedCountries.includes('Argentina') ? '#8b5cf6' : '#9ca3af',
                  // CORPORATE_GOVERNANCE countries
                  ['==', ['get', 'name_en'], 'South Africa'], 
                  highlightedCountries.includes('South Africa') ? '#f59e0b' : '#9ca3af'
                ] : [
                  // Normal colors when no highlighting
                  ['==', ['get', 'name_en'], 'United States'], '#ed5e2a',
                  ['==', ['get', 'name_en'], 'Netherlands'], '#ed5e2a',
                  ['==', ['get', 'name_en'], 'Germany'], '#ed5e2a',
                  ['==', ['get', 'name_en'], 'India'], '#22c55e',
                  ['==', ['get', 'name_en'], 'Poland'], '#22c55e',
                  ['==', ['get', 'name_en'], 'Bulgaria'], '#22c55e',
                  ['==', ['get', 'name_en'], 'Philippines'], '#3b82f6',
                  ['==', ['get', 'name_en'], 'Vietnam'], '#3b82f6',
                  ['==', ['get', 'name_en'], 'Paraguay'], '#8b5cf6',
                  ['==', ['get', 'name_en'], 'Argentina'], '#8b5cf6'
                ]),
                'rgba(248, 249, 250, 0.05)' // Almost invisible for other countries
              ]
            ],
            'fill-opacity': 0.6
          }
        })
      } catch (error) {
        console.error('Error updating map highlighting:', error)
      }
    }
    
    updateMapHighlighting()
    
    // Update marker colors
    const updateMarkerColors = () => {
      if (!window.countryMarkers) return
      
      window.countryMarkers.forEach(({ marker, groupKey, originalColor }) => {
        if (highlightedGroup) {
          // If this marker's group is highlighted, keep original color, otherwise make it grey
          const newColor = groupKey === highlightedGroup ? originalColor : '#9ca3af'
          marker.getElement().style.filter = groupKey === highlightedGroup ? 'none' : 'grayscale(100%)'
        } else {
          // No highlighting, restore original colors
          marker.getElement().style.filter = 'none'
        }
      })
    }
    
    updateMarkerColors()
  }, [highlightedGroup, mapData])

  const initializeMap = () => {
    console.log('Initializing map with container:', mapContainer.current)
    console.log('Container dimensions:', mapContainer.current.offsetWidth, 'x', mapContainer.current.offsetHeight)
    console.log('Container element:', mapContainer.current)

    try {
      // Set access token
      mapboxgl.accessToken = 'pk.eyJ1Ijoiam9uYXRoYW53aWxsaW5ndG9uIiwiYSI6ImNtOHltMW42ODAyYTcybHNma2doNHZmMngifQ.nsMYa2TTvTJGJyuMcmJV_A'
      
      console.log('Creating Mapbox map...')
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/jonathanwillington/cm8ym2u5b003d01r431z7872k',
        center: [0, 20], // Center of the world
        zoom: 2,
        maxZoom: 6 // Restrict maximum zoom to keep whole countries visible
      })

      console.log('Map initialized successfully')
      console.log('Map container after init:', mapContainer.current)
      console.log('Map object:', map.current)
      
      // Set map as loaded immediately after initialization
      setMapLoaded(true)
      
      // Force immediate resize and check canvas
      setTimeout(() => {
        if (map.current) {
          console.log('Forcing map resize...')
          map.current.resize()
          
          // Check if canvas exists
          const canvas = mapContainer.current.querySelector('canvas')
          console.log('Canvas element found:', canvas)
          if (canvas) {
            console.log('Canvas dimensions:', canvas.width, 'x', canvas.height)
            console.log('Canvas style:', canvas.style.cssText)
          }
        }
      }, 50)
      
      // Add navigation control
      map.current.addControl(new mapboxgl.NavigationControl())

      // Wait for the map style to load before adding custom layers
      map.current.on('load', () => {
        console.log('Map style loaded, adding custom layers...')
        
        // Small delay to ensure everything is ready
        setTimeout(() => {
          try {
          // Add custom layers
          addCustomLayers()
          
          // Debug: log some country names to see what properties are available
          map.current.on('sourcedata', (e) => {
            if (e.sourceId === 'countries' && e.isSourceLoaded) {
              console.log('Countries source loaded, checking available properties...')
              // Try to get a sample of country data
              const features = map.current.querySourceFeatures('countries', {
                sourceLayer: 'country_boundaries',
                filter: ['has', 'name_en']
              })
              if (features.length > 0) {
                console.log('Sample country properties:', features[0].properties)
                console.log('Available property keys:', Object.keys(features[0].properties))
              }
            }
          })

          // Add hover effects for countries
          map.current.on('mousemove', 'country-fill', (e) => {
            if (e.features.length > 0) {
              map.current.getCanvas().style.cursor = 'pointer'
              // Debug: log country names
              const countryName = e.features[0].properties.name_en
              if (countryName) {
                console.log('Hovering over country:', countryName)
              }
              map.current.setFeatureState({
                source: 'countries',
                sourceLayer: 'country_boundaries',
                id: e.features[0].id
              }, { hover: true })
            }
          })

          map.current.on('mouseleave', 'country-fill', () => {
            map.current.getCanvas().style.cursor = ''
            map.current.setFeatureState({
              source: 'countries',
              sourceLayer: 'country_boundaries',
              id: null
            }, { hover: false })
          })

          // Add click event to debug country names
          map.current.on('click', 'country-fill', (e) => {
            if (e.features.length > 0) {
              const countryName = e.features[0].properties.name_en
              console.log('Clicked on country:', countryName)
              console.log('Full properties:', e.features[0].properties)
              
              // Check what color this country should have
              let expectedColor = 'rgba(248, 249, 250, 0.05)' // Default light gray
              if (['United States', 'India', 'Brazil'].includes(countryName)) {
                expectedColor = '#6c5ce7' // Purple for scale
              } else if (['Philippines', 'Poland', 'Mexico'].includes(countryName)) {
                expectedColor = '#3498db' // Blue for high opportunity
              } else if (['Germany', 'France'].includes(countryName)) {
                expectedColor = '#f39c12' // Orange for high risk
              }
              console.log(`Expected color for ${countryName}:`, expectedColor)
              
              // Also check if this country is in our data
              if (mapData && mapData.map_data) {
                let found = false
                Object.entries(mapData.map_data).forEach(([key, group]) => {
                  if (group.countries) {
                    group.countries.forEach(country => {
                      if (country.country === countryName) {
                        found = true
                        console.log(`Found ${countryName} in group: ${key} with risk level: ${key}`)
                      }
                    })
                  }
                })
                if (!found) {
                  console.log(`${countryName} is NOT in our data - should be default color`)
                }
              }
            }
          })

          console.log('Custom layers added successfully')
        } catch (error) {
          console.error('Error adding custom layers:', error)
        }
        }, 500) // 500ms delay
      })

      // Store markers for later color updates
      window.countryMarkers = []
      
      // Add color-coded pins for each country
      const addCountryPins = () => {
        if (!mapData?.map_data) return
        
        Object.entries(mapData.map_data).forEach(([groupKey, group]) => {
          const groupColor = getGroupColor(groupKey)
          
          group.countries?.forEach(country => {
            const coordinates = countryCoordinates[country.country]
            if (coordinates) {
              const marker = new mapboxgl.Marker({
                color: groupColor,
                scale: 0.8
              })
                .setLngLat(coordinates)
                .setPopup(
                  new mapboxgl.Popup({ offset: 25 })
                    .setHTML(`
                      <div style="padding: 12px;">
                        <h3 style="margin: 0 0 4px 0; color: ${groupColor}; display: flex; align-items: center;">${getFlagHTML(country.country, country.code)} ${country.title || country.country}</h3>
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #666; font-weight: 500;">${country.country}</p>
                        <p style="margin: 0 0 5px 0; font-weight: 600;">${country.category}</p>
                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">${country.issue}</p>
                        ${country.salary ? `
                          <div style="margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 4px;">
                            <div style="font-size: 11px; font-weight: 600; color: #374151; margin-bottom: 4px;">Salary Ranges (USD):</div>
                            ${Object.entries(country.salary).map(([role, range]) => `
                              <div style="font-size: 10px; color: #6b7280; margin-bottom: 2px;">
                                <span style="text-transform: capitalize; font-weight: 500;">${role.replace('_', ' ')}:</span> ${range}
                              </div>
                            `).join('')}
                          </div>
                        ` : ''}
                        ${country.recommended_actions?.[0] ? `
                          <div style="margin-top: 8px; padding: 6px 8px; background: ${groupColor}15; border-radius: 4px;">
                            <strong style="color: ${groupColor};">Action:</strong> ${country.recommended_actions[0].action}
                          </div>
                        ` : ''}
                      </div>
                    `)
                )
                .addTo(map.current)
              
              // Store marker with metadata for later updates
              window.countryMarkers.push({
                marker,
                groupKey,
                country: country.country,
                originalColor: groupColor
              })
            }
          })
        })
      }

      // Add pins after a short delay to ensure map data is available
      setTimeout(() => {
        addCountryPins()
        // After markers are created, apply current highlighting if any
        if (highlightedGroup) {
          const updateMarkerColors = () => {
            if (!window.countryMarkers) return
            
            window.countryMarkers.forEach(({ marker, groupKey, originalColor }) => {
              if (highlightedGroup) {
                // If this marker's group is highlighted, keep original color, otherwise make it grey
                const newColor = groupKey === highlightedGroup ? originalColor : '#9ca3af'
                marker.getElement().style.filter = groupKey === highlightedGroup ? 'none' : 'grayscale(100%)'
              } else {
                // No highlighting, restore original colors
                marker.getElement().style.filter = 'none'
              }
            })
          }
          updateMarkerColors()
        }
      }, 100)

      console.log('Country pins and layers added successfully')
      
      // Handle map resize
      const handleResize = () => {
        if (map.current) {
          map.current.resize()
        }
      }
      
      window.addEventListener('resize', handleResize)
      
      // Force a resize after a short delay to fix initial sizing
      setTimeout(() => {
        if (map.current) {
          map.current.resize()
        }
      }, 1000)
      
      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    } catch (error) {
      console.error('Error initializing map:', error)
      console.error('Error details:', error.message, error.stack)
      return
    }
  }



  const flyToCountry = (countryName) => {
    if (!map.current) return
    
    const coordinates = countryCoordinates[countryName]
    const zoomLevel = countryZoomLevels[countryName] || 4 // Default zoom for unknown countries
    
    if (coordinates) {
      map.current.flyTo({
        center: coordinates,
        zoom: zoomLevel, // Dynamic zoom based on country size
        duration: 2000
      })
      setSelectedCountry(countryName)
    }
  }

  const handleAction = (actionUrl, actionType) => {
    console.log(`Taking action: ${actionType} - ${actionUrl}`)
    // In a real app, this would navigate to the Deel platform
    alert(`This would navigate to: ${actionUrl}`)
  }

  const handleComplianceArticleClick = (article) => {
    setSelectedComplianceArticle(article)
  }

  const closeComplianceArticle = () => {
    setSelectedComplianceArticle(null)
  }

  const addCustomLayers = () => {
    if (!map.current) return
    
    try {
      // Add custom country highlighting based on status
      if (!map.current.getSource('countries')) {
        map.current.addSource('countries', {
          type: 'vector',
          url: 'mapbox://mapbox.country-boundaries-v1'
        })
      }
      
      // Add initial country fill layer
      if (!map.current.getLayer('country-fill')) {
        map.current.addLayer({
          id: 'country-fill',
          type: 'fill',
          source: 'countries',
          'source-layer': 'country_boundaries',
          paint: {
            'fill-color': [
              'case',
              // CRITICAL countries (orange)
              ['==', ['get', 'name_en'], 'United States'], '#ed5e2a',
              ['==', ['get', 'name_en'], 'Netherlands'], '#ed5e2a',
              ['==', ['get', 'name_en'], 'Germany'], '#ed5e2a',
              // GROWTH countries (green)
              ['==', ['get', 'name_en'], 'India'], '#22c55e',
              ['==', ['get', 'name_en'], 'Poland'], '#22c55e',
              ['==', ['get', 'name_en'], 'Bulgaria'], '#22c55e',
              // OPPORTUNITY countries (blue)
              ['==', ['get', 'name_en'], 'Philippines'], '#3b82f6',
              ['==', ['get', 'name_en'], 'Vietnam'], '#3b82f6',
              // COMPENSATION_MANAGEMENT countries (purple)
              ['==', ['get', 'name_en'], 'Paraguay'], '#8b5cf6',
              ['==', ['get', 'name_en'], 'Argentina'], '#8b5cf6',
              // CORPORATE_GOVERNANCE countries (amber)
              ['==', ['get', 'name_en'], 'South Africa'], '#f59e0b',
              'rgba(248, 249, 250, 0.05)' // Almost invisible for other countries
            ],
            'fill-opacity': 0.6
          }
        })
      }

      // Add country borders
      if (!map.current.getLayer('country-borders')) {
        map.current.addLayer({
          id: 'country-borders',
          type: 'line',
          source: 'countries',
          'source-layer': 'country_boundaries',
          paint: {
            'line-color': '#2d3436',
            'line-width': 1
          }
        })
      }
    } catch (error) {
      console.error('Error adding custom layers:', error)
    }
  }


  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'CRITICAL': return 'rgb(212, 45, 53)'
      case 'HIGH': return '#ea580c'
      case 'MEDIUM-HIGH': return '#d97706'
      case 'MEDIUM': return '#ca8a04'
      case 'LOW': return '#16a34a'
      case 'OPPORTUNITY': return '#2563eb'
      case 'GROWTH': return '#7c3aed'
      case 'STRATEGIC': return '#0891b2'
      case 'CONSOLIDATION': return '#9333ea'
      default: return '#6b7280'
    }
  }

  const getRiskBackgroundColor = (riskLevel) => {
    switch (riskLevel) {
      case 'CRITICAL': return 'rgb(255, 245, 243)'
      case 'HIGH': return '#fed7aa'
      case 'MEDIUM-HIGH': return '#fef3c7'
      case 'MEDIUM': return '#fef3c7'
      case 'LOW': return '#bbf7d0'
      case 'OPPORTUNITY': return '#bfdbfe'
      case 'GROWTH': return '#ddd6fe'
      case 'STRATEGIC': return '#e0f2fe'
      case 'CONSOLIDATION': return '#f3e8ff'
      default: return '#f3f4f6'
    }
  }

  const getGroupIcon = (groupKey) => {
    switch (groupKey) {
      case 'CRITICAL': return <AlertTriangle className="w-6 h-6" style={{strokeWidth: 2.5, color: '#ed5e2a'}} />
      case 'HIGH': return <AlertTriangle className="w-6 h-6 text-orange-700" style={{strokeWidth: 2.5}} />
      case 'GROWTH': return <TrendingUp className="w-6 h-6 text-green-700" style={{strokeWidth: 2.5}} />
      case 'OPPORTUNITY': return <MapPin className="w-6 h-6 text-blue-700" style={{strokeWidth: 2.5}} />
      case 'COMPENSATION_MANAGEMENT': return <DollarSign className="w-6 h-6 text-purple-700" style={{strokeWidth: 2.5}} />
      case 'CORPORATE_GOVERNANCE': return <Building2 className="w-6 h-6 text-amber-700" style={{strokeWidth: 2.5}} />
      case 'contractor_risk': return '●'
      case 'direct_employment_outside_deel': return '●'
      case 'unsupported_countries': return '●'
      case 'expansion_targets': return '●'
      case 'cost_arbitrage_opportunities': return '●'
      case 'entity_establishment_candidates': return '●'
      case 'foreign_entities_to_onboard': return '●'
      default: return '●'
    }
  }

  const getGroupDisplayName = (groupKey) => {
    switch (groupKey) {
      case 'CRITICAL': return 'Compliance risks'
      case 'HIGH': return 'High'
      case 'GROWTH': return 'Grow existing work hubs'
      case 'OPPORTUNITY': return 'Hire in new territories'
      case 'COMPENSATION_MANAGEMENT': return 'Compensation management'
      case 'CORPORATE_GOVERNANCE': return 'Corporate governance'
      default: return groupKey.charAt(0).toUpperCase() + groupKey.slice(1).toLowerCase()
    }
  }

  const getGroupColor = (groupKey) => {
    switch (groupKey) {
      case 'CRITICAL': return '#ed5e2a'
      case 'HIGH': return '#f97316'
      case 'GROWTH': return '#22c55e'
      case 'OPPORTUNITY': return '#3b82f6'
      case 'COMPENSATION_MANAGEMENT': return '#8b5cf6'
      case 'CORPORATE_GOVERNANCE': return '#f59e0b'
      default: return '#6b7280'
    }
  }

  // Country code mapping for flags
  const countryCodeMap = {
    'United States': 'US',
    'Netherlands': 'NL', 
    'Germany': 'DE',
    'India': 'IN',
    'Poland': 'PL',
    'Bulgaria': 'BG',
    'Philippines': 'PH',
    'Vietnam': 'VN',
    'Paraguay': 'PY',
    'Argentina': 'AR',
    'South Africa': 'ZA'
  }

  // Get country flag HTML for popups (using circular flags from circle-flags)
  const getFlagHTML = (countryName, countryCode) => {
    const code = countryCode || countryCodeMap[countryName]
    if (!code) return countryName?.charAt(0) || '?'
    
    // Use circle-flags SVG for circular appearance in popups
    return `<img src="https://hatscripts.github.io/circle-flags/flags/${code.toLowerCase()}.svg" alt="${countryName} flag" style="width: 20px; height: 20px; object-fit: cover; border-radius: 50%; margin-right: 8px; display: inline-block; vertical-align: middle;" />`
  }

  // Get country flag (React component)
  const getCountryFlag = (countryName, countryCode) => {
    return <Flag countryName={countryName} countryCode={countryCode} size="w-6 h-6" />
  }

  // Toggle accordion expansion
  const toggleAccordion = (accordionId) => {
    setExpandedAccordions(prev => ({
      ...prev,
      [accordionId]: !prev[accordionId]
    }))
  }

  // Toggle group expansion (only one group open at a time)
  const toggleGroup = (groupKey) => {
    const isCurrentlyExpanded = expandedGroups[groupKey]
    
    if (isCurrentlyExpanded) {
      // If clicking on the currently expanded group, close it
      setExpandedGroups({})
      setHighlightedGroup(null)
      setSelectedComplianceArticle(null) // Close compliance article
      
      // Reset map view to show all countries
      if (map.current) {
        map.current.flyTo({
          center: [0, 20],
          zoom: 2,
          duration: 2000
        })
        setSelectedCountry(null)
      }
    } else {
      // If clicking on a different group, close all others and open this one
      setExpandedGroups({ [groupKey]: true })
      setHighlightedGroup(groupKey)
      setSelectedComplianceArticle(null) // Close compliance article when switching groups
      
      // Scroll the expanded group into view with a more robust approach
      const scrollToGroup = () => {
        const groupElement = document.querySelector(`[data-group="${groupKey}"]`)
        if (groupElement) {
          const sidebarContent = document.querySelector('.sidebar-content')
          if (sidebarContent) {
            // Use scrollIntoView for more reliable behavior
            groupElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
              inline: 'nearest'
            })
          }
        }
      }
      
      // Try multiple times to ensure the DOM has updated
      setTimeout(scrollToGroup, 100)
      setTimeout(scrollToGroup, 400)
      setTimeout(scrollToGroup, 700)
      
      // Fly to the first country in the group
      if (mapData?.map_data[groupKey]?.countries?.length > 0) {
        const firstCountry = mapData.map_data[groupKey].countries[0]
        flyToCountry(firstCountry.country)
        
        // For CRITICAL group, automatically show the compliance article for the first country
        if (groupKey === 'CRITICAL' && firstCountry.compliance_article) {
          handleComplianceArticleClick(firstCountry.compliance_article)
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="dashboard-app">
        <div className="css-120cenb"></div>
        <TopNav />
        <div className="dashboard-main">
          {/* Map Container with Spinner */}
          <div className="dashboard-map">
            <div className="map-display">
              <div className="map-loading">
                <div className="loading-content">
                  <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                  </div>
                  <div className="loading-text">Loading map...</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar with Skeletons */}
          <div className="dashboard-sidebar">
            <div className="sidebar-header">
              <div className="skeleton-title"></div>
            </div>
            <div className="sidebar-content">
              {/* Quick Actions Skeleton */}
              <div className="dashboard-card skeleton-card">
                <div className="card-header">
                  <div className="skeleton-card-title">
                    <div className="skeleton-icon"></div>
                    <div className="skeleton-text skeleton-text--title"></div>
                  </div>
                </div>
                <div className="card-content">
                  <div className="skeleton-list">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="skeleton-item">
                        <div className="skeleton-flag"></div>
                        <div className="skeleton-content">
                          <div className="skeleton-text skeleton-text--name"></div>
                          <div className="skeleton-text skeleton-text--subtitle"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Country Groups Skeletons */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="dashboard-card skeleton-card">
                  <div className="card-header">
                    <div className="skeleton-card-title">
                      <div className="skeleton-icon"></div>
                      <div className="skeleton-text skeleton-text--title"></div>
                    </div>
                    <div className="skeleton-chevron"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!mapData) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-slate-50 text-slate-700">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Failed to load workforce data</h2>
          <p>Please refresh the page to try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-app">
      <div className="css-120cenb"></div>
      <TopNav />
      <div className="dashboard-main">
        {/* Map Container */}
        <div className="dashboard-map">
          <div 
            ref={mapContainer} 
            className="map-display"
          />
          
          {/* Compliance Article Card */}
          {selectedComplianceArticle && (
            <div className="compliance-article-card">
              <div className="compliance-article-content">
                <button 
                  className="compliance-article-close"
                  onClick={closeComplianceArticle}
                  aria-label="Close article"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                
                <div className="compliance-article-image">
                  <img 
                    src={selectedComplianceArticle.feature_image} 
                    alt={selectedComplianceArticle.title}
                    style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                </div>
                
                <div className="compliance-article-header">
                  <h3 className="compliance-article-title">{selectedComplianceArticle.title}</h3>
                  <p className="compliance-article-description">{selectedComplianceArticle.description}</p>
                </div>
                
                <div className="compliance-article-actions">
                  <Button
                    variant="default"
                    size="sm"
                    className="compliance-article-button"
                    onClick={() => {
                      console.log('Navigate to compliance monitor')
                      alert('This would navigate to the compliance monitor')
                    }}
                  >
                    View in compliance monitor
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {/* Map Legend */}
          <div className="map-legend">
            <div className="legend-title">Country Categories</div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#ed5e2a' }}></div>
              <span className="legend-text">Compliance Risks</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#22c55e' }}></div>
              <span className="legend-text">Growth</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
              <span className="legend-text">Hire in new territories</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#8b5cf6' }}></div>
              <span className="legend-text">Compensation</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
              <span className="legend-text">Corporate governance</span>
            </div>
          </div>

          
          {!mapLoaded && (
            <div className="map-loading">
              <div className="loading-content">
                <div className="loading-icon">🗺️</div>
                <div className="loading-text">Loading map...</div>
                <div className="loading-subtext">Check console for debug info</div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Dashboard */}
        <div className="dashboard-sidebar">
          {/* Header */}
          <div className="sidebar-header">
            <h1 className="sidebar-title">
              Global workforce management
            </h1>
            <p className="sidebar-subtitle">
              Monitor and grow your global workforce with Deel
            </p>
          </div>
          
          <div className="sidebar-content">
                                        {/* Company Snapshot */}
          {mapData.company_snapshot && (
            <div className="dashboard-card">
              <div className="card-header">
                <div className="card-title">
                  <Users className="w-5 h-5" />
                  Company Overview
                </div>
              </div>
              <div className="card-content">
                <div className="stats-grid">
                  <div className="stat-item stat-item--primary">
                    <div className="stat-value stat-value--primary">
                      {mapData.company_snapshot.total_headcount}
                    </div>
                    <div className="stat-label stat-label--primary">
                      Total Headcount
                    </div>
                  </div>
                  <div className="stat-item stat-item--success">
                    <div className="stat-value stat-value--success">
                      {mapData.company_snapshot.deel_managed}
                    </div>
                    <div className="stat-label stat-label--success">
                      On Deel
                    </div>
                  </div>
                </div>
                
                <div className="stats-grid">
                  <div className="stat-item stat-item--danger">
                    <div className="stat-value stat-value--danger">
                      {mapData.company_snapshot.contractors_at_risk}
                    </div>
                    <div className="stat-label stat-label--danger">
                      At Risk
                    </div>
                  </div>
                  <div className="stat-item stat-item--warning">
                    <div className="stat-value stat-value--warning">
                      {mapData.company_snapshot.annual_compliance_exposure}
                    </div>
                    <div className="stat-label stat-label--warning">
                      Risk Exposure
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

                    {/* Quick Actions - Crisis Management */}
          {mapData.quick_action_menu && (
            <div className="dashboard-card dashboard-card--crisis">
              <div className="card-header">
                <div className="card-title">
                  <AlertTriangle className="w-5 h-5" />
                  Attention needed
                </div>
              </div>
              <div className="card-content">
                <div className="country-list">
                  {mapData.quick_action_menu.crisis_management.map((action, index) => (
                    <div 
                      key={index}
                      className="country-item"
                      onClick={() => handleAction(action.action_url, action.label)}
                    >
                      <div className="country-header">
                        <div className="country-info">
                          <h4 className="country-name">
                            {action.label}
                          </h4>
                          <div className="status-badge status-badge--secondary">
                            {action.urgency}
                          </div>
                        </div>
                      </div>
                      <div className="country-details">
                        {action.count} contractors • Risk: {action.risk}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}



                    {/* Country Groupings */}
          {mapData.map_data && Object.entries(mapData.map_data).map(([groupKey, group]) => (
                            <div key={groupKey} className={`dashboard-card dashboard-card--${groupKey.toLowerCase()} ${expandedGroups[groupKey] ? 'expanded' : ''}`} data-group={groupKey}>
                <div 
                  className="card-header clickable-header"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleGroup(groupKey);
                  }}
                >
                  <div className="card-title">
                    <div className="group-icon-container">
                      <div className="group-icon">
                        {getGroupIcon(groupKey)}
                      </div>
                      <div className="group-counter-badge">
                        {(group.countries || group.entities || []).length}
                      </div>
                    </div>
                    {getGroupDisplayName(groupKey)}
                  </div>
                  <button 
                    className="section-accordion-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGroup(groupKey);
                    }}
                  >
                    <Chevron expanded={expandedGroups[groupKey]} size={16} color="#6b7280" />
                  </button>
                </div>
                
                <div className={`card-content ${expandedGroups[groupKey] ? 'expanded' : ''}`}>
                    {/* Group explanation - only visible when expanded */}
                    <div className="group-explanation">
                      {groupKey === 'CRITICAL' && 'Immediate action required to avoid legal penalties and financial risks'}
                      {groupKey === 'HIGH' && 'High-priority issues requiring attention within 30 days'}
                      {groupKey === 'GROWTH' && 'Expansion opportunities with strong performance indicators'}
                      {groupKey === 'OPPORTUNITY' && 'Cost-effective talent acquisition and market entry possibilities'}
                      {groupKey === 'COMPENSATION_MANAGEMENT' && 'Optimize compensation structures and benefits for competitive market positioning'}
                      {groupKey === 'CORPORATE_GOVERNANCE' && 'Entity establishment and governance optimization for tax efficiency and compliance'}
                    </div>
                    <div className="country-list">
                    {(group.countries || group.entities || []).slice(0, 3).map((item, index) => (
                      <div 
                        key={index}
                        onClick={() => {
                          if (groupKey === 'CRITICAL' && item.compliance_article) {
                            // If the same article is already open, close it
                            if (selectedComplianceArticle && selectedComplianceArticle.title === item.compliance_article.title) {
                              closeComplianceArticle()
                            } else {
                              handleComplianceArticleClick(item.compliance_article)
                            }
                            flyToCountry(item.country)
                          } else {
                            flyToCountry(item.country)
                          }
                        }}
                        className={`country-item ${
                          selectedCountry === item.country ? 'country-item--selected' : ''
                        }`}
                      >
                        <div className="country-header">
                          <div className="country-flag">
                            {getCountryFlag(item.country, item.code)}
                          </div>
                          <div className="country-info">
                            <h4 className="country-name">
                              {item.title || item.country}
                            </h4>
                            <p className="country-location text-xs text-gray-500">
                              {item.country}
                            </p>

                          </div>
                        </div>
        
                        {groupKey !== 'COMPENSATION_MANAGEMENT' && groupKey !== 'CRITICAL' && (
                          <div className="country-details">
                            {item.issue}
                          </div>
                        )}

                        {/* Workers at risk - only for compliance countries */}
                        {groupKey === 'CRITICAL' && item.workers_at_risk && (
                          <div className={`growth-metrics ${expandedAccordions[`critical-${index}`] ? 'expanded' : ''}`}>
                            <div className="metric-row metric-row--header">
                              <div className="metric-label">Workers at risk</div>
                              <div className="metric-value">{item.workers_at_risk.count}</div>
                              <button 
                                className="accordion-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAccordion(`critical-${index}`);
                                }}
                              >
                                <Chevron expanded={expandedAccordions[`critical-${index}`]} size={12} color="#6b7280" />
                              </button>
                            </div>
                            <div className="metric-accordion">
                              <div className="metric-row">
                                <div className="metric-label">Severity Rating</div>
                                <div className="metric-value">{item.workers_at_risk.severity_rating}</div>
                              </div>
                              <div className="metric-row">
                                <div className="metric-label">Suggestion</div>
                                <div className="metric-value">{item.workers_at_risk.suggestion}</div>
                              </div>
                              {item.reference_article && (
                                <div className="metric-row">
                                  <div className="metric-label">Reference Article</div>
                                  <div className="metric-value reference-article">
                                    {item.reference_article.title}
                                    <a 
                                      href={item.reference_article.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="expand-icon"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <polyline points="15,3 21,3 21,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        <line x1="10" y1="14" x2="21" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Growth-specific metrics */}
                        {groupKey === 'GROWTH' && item.growth_metrics && (
                          <div className={`growth-metrics ${expandedAccordions[`growth-${index}`] ? 'expanded' : ''}`}>
                            <div className="metric-row metric-row--header">
                              <div className="metric-label">Current Employees</div>
                              <div className="metric-value">{item.growth_metrics.current_headcount}</div>
                              <button 
                                className="accordion-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAccordion(`growth-${index}`);
                                }}
                              >
                                <Chevron expanded={expandedAccordions[`growth-${index}`]} size={12} color="#6b7280" />
                              </button>
                            </div>
                            <div className="metric-accordion">
                              <div className="metric-row">
                                <div className="metric-label">Avg PMC Q325 Rating</div>
                                <div className="metric-value">{item.growth_metrics.performance_rating}</div>
                              </div>
                              <div className="metric-row">
                                <div className="metric-label">Cost Savings</div>
                                <div className="metric-value">{item.growth_metrics.cost_savings}</div>
                              </div>
                              <div className="metric-row">
                                <div className="metric-label">Retention Rate</div>
                                <div className="metric-value">{item.growth_metrics.retention_rate}</div>
                              </div>
                              <div className="metric-row">
                                <div className="metric-label">Skill Availability</div>
                                <div className="metric-value">{item.growth_metrics.skill_availability}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* High-specific metrics */}
                        {groupKey === 'HIGH' && (
                          <div className={`growth-metrics ${expandedAccordions[`high-${index}`] ? 'expanded' : ''}`}>
                            <div className="metric-row metric-row--header">
                              <div className="metric-label">Risk Level</div>
                              <div className="metric-value">{item.category || 'N/A'}</div>
                              <button 
                                className="accordion-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAccordion(`high-${index}`);
                                }}
                              >
                                <Chevron expanded={expandedAccordions[`high-${index}`]} size={12} color="#6b7280" />
                              </button>
                            </div>
                            <div className="metric-accordion">
                              {item.country === 'Paraguay' && item.average_underpayment && (
                                <div className="metric-row">
                                  <div className="metric-label">Average Underpayment</div>
                                  <div className="metric-value">{item.average_underpayment}</div>
                                </div>
                              )}
                              {item.country === 'Germany' && item.associated_article && (
                                <div className="metric-row">
                                  <div className="metric-label">Reference Article</div>
                                  <div className="metric-value reference-article">{item.associated_article}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Compensation Management-specific metrics */}
                        {groupKey === 'COMPENSATION_MANAGEMENT' && (
                          <div className="growth-metrics">
                            <div className="metric-row metric-row--header">
                              <div className="metric-label">Compensation Irregularity</div>
                              <div className="metric-value">{item.comp_irregularity || 'N/A'}</div>
                              <div className="trend-indicator trend-indicator--low">
                                <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                                  <path d="M15 1L12 4L8 3L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M5 11H1V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            </div>
                            <div className="metric-row">
                              <div className="metric-label">Most impacted job titles</div>
                              <div className="metric-value">{item.most_impacted_job_titles || 'N/A'}</div>
                            </div>
                            <div className="metric-row">
                              <div className="metric-label">Employees at risk of churn</div>
                              <div className="metric-value">{item.employees_at_risk_of_churn || 'N/A'}</div>
                            </div>
                          </div>
                        )}



                        {/* Corporate Governance-specific metrics */}
                        {groupKey === 'CORPORATE_GOVERNANCE' && item.entity_setup && (
                          <div className="growth-metrics">
                            <div className="metric-row">
                              <div className="metric-label">Setup Time</div>
                              <div className="metric-value">{item.entity_setup.setup_time}</div>
                            </div>
                            <div className="metric-row">
                              <div className="metric-label">Annual Cost</div>
                              <div className="metric-value">{item.entity_setup.annual_cost}</div>
                            </div>
                            <div className="metric-row">
                              <div className="metric-label">Tax Benefits</div>
                              <div className="metric-value">{item.entity_setup.tax_benefits}</div>
                            </div>
                            <div className="metric-row">
                              <div className="metric-label">Compliance Score</div>
                              <div className="metric-value">{item.entity_setup.compliance_score}</div>
                            </div>
                          </div>
                        )}

                        {/* Opportunity-specific metrics */}
                        {groupKey === 'OPPORTUNITY' && (
                          <div className={`growth-metrics ${expandedAccordions[`opportunity-${index}`] ? 'expanded' : ''}`}>
                            <div className="metric-row metric-row--header">
                              <div className="metric-label">Cost Savings</div>
                              <div className="metric-value">70-80%</div>
                              <button 
                                className="accordion-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAccordion(`opportunity-${index}`);
                                }}
                              >
                                <Chevron expanded={expandedAccordions[`opportunity-${index}`]} size={12} color="#6b7280" />
                              </button>
                            </div>
                            <div className="metric-accordion">
                              <div className="metric-row">
                                <div className="metric-label">Category</div>
                                <div className="metric-value">{item.category || 'N/A'}</div>
                              </div>
                              {item.salary && Object.entries(item.salary).map(([role, range]) => (
                                <div key={role} className="metric-row">
                                  <div className="metric-label" style={{ textTransform: 'capitalize' }}>{role.replace('_', ' ')}</div>
                                  <div className="metric-value">{range}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {item.recommended_actions && item.recommended_actions.length > 0 && (
                          <div className="country-actions">
                            {item.recommended_actions.map((action, actionIndex) => (
                              <Button
                                key={actionIndex}
                                variant="default"
                                size="sm"
                                className="text-xs h-6 px-2 country-action-btn"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleAction(`/${action.deel_feature}`, action.action)
                                }}
                              >
                                {action.action}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {(group.countries || group.entities || []).length > 3 && (
                      <div className="text-center py-2 text-xs text-slate-500 italic">
                        +{(group.countries || group.entities || []).length - 3} more...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

                    {/* Financial Impact - only show in actions view */}
          {activeView === 'actions' && mapData.financial_impact_analysis && (
            <div className="dashboard-card dashboard-card--financial">
              <div className="card-header">
                <div className="card-title">
                  <DollarSign className="w-5 h-5" />
                  Year 1 Financial Impact
                </div>
              </div>
              <div className="card-content">
                <div className="stats-grid">
                  <div className="stat-item stat-item--success">
                    <div className="stat-value stat-value--success">
                      {mapData.financial_impact_analysis.total_year_1_impact.savings.total}
                    </div>
                    <div className="stat-label stat-label--success">
                      Total Savings
                    </div>
                  </div>
                  <div className="stat-item stat-item--danger">
                    <div className="stat-value stat-value--danger">
                      {mapData.financial_impact_analysis.total_year_1_impact.costs.total}
                    </div>
                    <div className="stat-label stat-label--danger">
                      Investment
                    </div>
                  </div>
                </div>
                    
                <div className="financial-summary">
                  <div className="stat-value stat-value--primary">
                    {mapData.financial_impact_analysis.total_year_1_impact.net_benefit}
                  </div>
                  <div className="stat-label stat-label--primary">
                    Net Benefit
                  </div>
                  <div className="stat-label stat-label--primary">
                    ROI: {mapData.financial_impact_analysis.total_year_1_impact.roi}
                  </div>
                </div>
              </div>
            </div>
          )}
          </div>
      </div>
      </div>

    </div>
  )
}

export default App

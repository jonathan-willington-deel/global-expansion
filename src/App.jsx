import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import { Button } from './components/ui/button'
import TopNav from './components/TopNav'

import { AlertTriangle, TrendingUp, Users, Building2, DollarSign, MapPin } from 'lucide-react'
import Flag from './components/Flag'
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

  // Country coordinates for pins
  const countryCoordinates = {
    'United States': [-98.5795, 39.8283],
    'Netherlands': [5.2913, 52.1326],
    'Germany': [10.4515, 51.1657],
    'India': [78.9629, 20.5937],
    'Ukraine': [31.1656, 48.3794],
    'Philippines': [121.7740, 12.8797],
    'Paraguay': [-58.4438, -23.4425],
    'Argentina': [-63.6167, -38.4161],
    'South Africa': [24.9916, -30.5595]
  }

  useEffect(() => {
    // Load map data only once
    if (mapData) return
    
    setLoading(true)
    console.log('Starting to fetch map data...')
    
    fetch('/map.json')
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
              '#dc2626', // Darker red for CRITICAL hover
              ['all',
                ['boolean', ['feature-state', 'hover'], false],
                ['any',
                  ['==', ['get', 'name_en'], 'India'],
                  ['==', ['get', 'name_en'], 'Ukraine']
                ]
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
                  highlightedCountries.includes('United States') ? '#ef4444' : '#9ca3af',
                  ['==', ['get', 'name_en'], 'Netherlands'], 
                  highlightedCountries.includes('Netherlands') ? '#ef4444' : '#9ca3af',
                  ['==', ['get', 'name_en'], 'Germany'], 
                  highlightedCountries.includes('Germany') ? '#ef4444' : '#9ca3af',
                  // GROWTH countries
                  ['==', ['get', 'name_en'], 'India'], 
                  highlightedCountries.includes('India') ? '#22c55e' : '#9ca3af',
                  ['==', ['get', 'name_en'], 'Ukraine'], 
                  highlightedCountries.includes('Ukraine') ? '#22c55e' : '#9ca3af',
                  // OPPORTUNITY countries
                  ['==', ['get', 'name_en'], 'Philippines'], 
                  highlightedCountries.includes('Philippines') ? '#3b82f6' : '#9ca3af',
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
                  ['==', ['get', 'name_en'], 'United States'], '#ef4444',
                  ['==', ['get', 'name_en'], 'Netherlands'], '#ef4444',
                  ['==', ['get', 'name_en'], 'Germany'], '#ef4444',
                  ['==', ['get', 'name_en'], 'India'], '#22c55e',
                  ['==', ['get', 'name_en'], 'Ukraine'], '#22c55e',
                  ['==', ['get', 'name_en'], 'Philippines'], '#3b82f6',
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
        style: 'mapbox://styles/mapbox/light-v11',
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
          // Add custom country highlighting based on status
          map.current.addSource('countries', {
            type: 'vector',
            url: 'mapbox://mapbox.country-boundaries-v1'
          })
          
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

          // Add initial country fill layer
          map.current.addLayer({
            id: 'country-fill',
            type: 'fill',
            source: 'countries',
            'source-layer': 'country_boundaries',
            paint: {
              'fill-color': [
                'case',
                // CRITICAL countries (red)
                ['==', ['get', 'name_en'], 'United States'], '#ef4444',
                ['==', ['get', 'name_en'], 'Netherlands'], '#ef4444',
                ['==', ['get', 'name_en'], 'Germany'], '#ef4444',
                // GROWTH countries (green)
                ['==', ['get', 'name_en'], 'India'], '#22c55e',
                ['==', ['get', 'name_en'], 'Ukraine'], '#22c55e',
                // OPPORTUNITY countries (blue)
                ['==', ['get', 'name_en'], 'Philippines'], '#3b82f6',
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

          // Add country borders
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
              } else if (countryName === 'Ukraine') {
                expectedColor = '#e74c3c' // Red for crisis
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
                        <h3 style="margin: 0 0 8px 0; color: ${groupColor}; display: flex; align-items: center;">${getFlagHTML(country.country, country.code)} ${country.country}</h3>
                        <p style="margin: 0 0 5px 0; font-weight: 600;">${country.category}</p>
                        <p style="margin: 0 0 8px 0; font-size: 13px; color: #666;">${country.issue}</p>
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
      setTimeout(addCountryPins, 100)

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
    if (coordinates) {
      map.current.flyTo({
        center: coordinates,
        zoom: 5, // Slightly reduced to ensure whole country is visible
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
      case 'CRITICAL': return <AlertTriangle className="w-6 h-6 text-red-700" style={{strokeWidth: 2.5}} />
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
      case 'GROWTH': return 'Growth'
      case 'OPPORTUNITY': return 'Hire in new territories'
      case 'COMPENSATION_MANAGEMENT': return 'Compensation management'
      case 'CORPORATE_GOVERNANCE': return 'Corporate governance'
      default: return groupKey.charAt(0).toUpperCase() + groupKey.slice(1).toLowerCase()
    }
  }

  const getGroupColor = (groupKey) => {
    switch (groupKey) {
      case 'CRITICAL': return '#ef4444'
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
    'Ukraine': 'UA',
    'Philippines': 'PH',
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

  // Toggle group expansion
  const toggleGroup = (groupKey) => {
    const isCurrentlyExpanded = expandedGroups[groupKey]
    
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }))
    
    // Set highlight when expanding, remove when collapsing
    if (!isCurrentlyExpanded) {
      setHighlightedGroup(groupKey)
      
      // Fly to the first country in the group
      if (mapData?.map_data[groupKey]?.countries?.length > 0) {
        const firstCountry = mapData.map_data[groupKey].countries[0].country
        flyToCountry(firstCountry)
      }
    } else {
      setHighlightedGroup(null)
      
      // Reset map view to show all countries
      if (map.current) {
        map.current.flyTo({
          center: [0, 20],
          zoom: 2,
          duration: 2000
        })
        setSelectedCountry(null)
      }
    }
  }

  if (loading) {
    return (
      <div className="w-screen h-screen flex justify-center bg-slate-50">
        <div className="flex w-full h-screen max-w-7xl bg-white shadow-lg">
          <div className="flex-1 relative">
            <div ref={mapContainer} className="w-full h-full" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/95 p-8 rounded-lg text-lg text-slate-700 shadow-lg">
              Loading global workforce data...
            </div>
          </div>
          
          <div className="w-[500px] bg-slate-50 border-l border-slate-200 flex items-center justify-center text-slate-600">
            Loading dashboard...
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
          
          {/* Map Legend */}
          <div className="map-legend">
            <div className="legend-title">Country Categories</div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
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
                            <div key={groupKey} className={`dashboard-card dashboard-card--${groupKey.toLowerCase()}`} style={{ backgroundColor: getRiskBackgroundColor(groupKey) }}>
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
                    className={`section-accordion-button ${expandedGroups[groupKey] ? 'expanded' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGroup(groupKey);
                    }}
                  >
                    {expandedGroups[groupKey] ? '▲' : '▼'}
                  </button>
                </div>
                
                {expandedGroups[groupKey] && (
                  <div className="card-content">
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
                        onClick={() => flyToCountry(item.country)}
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
                              {item.country}
                            </h4>

                          </div>
                        </div>
        
                        {groupKey !== 'COMPENSATION_MANAGEMENT' && groupKey !== 'CRITICAL' && (
                          <div className="country-details">
                            {item.category && `${item.category}`}
                            {item.issue && ` • ${item.issue.substring(0, 50)}...`}
                          </div>
                        )}

                        {/* Workers at risk - only for compliance countries */}
                        {groupKey === 'CRITICAL' && item.workers_at_risk && (
                          <div className="growth-metrics">
                            <div className="metric-row metric-row--header">
                              <div className="metric-label">Workers at risk</div>
                              <div className="metric-value">{item.workers_at_risk.count}</div>
                              <button 
                                className="accordion-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const metricsContainer = e.target.closest('.growth-metrics');
                                  metricsContainer.classList.toggle('expanded');
                                }}
                              >
                                ▼
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
                          <div className="growth-metrics">
                            <div className="metric-row metric-row--header">
                              <div className="metric-label">Current Employees</div>
                              <div className="metric-value">{item.growth_metrics.current_headcount}</div>
                              <button 
                                className="accordion-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const metricsContainer = e.target.closest('.growth-metrics');
                                  metricsContainer.classList.toggle('expanded');
                                }}
                              >
                                ▼
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
                          <div className="growth-metrics">
                            <div className="metric-row metric-row--header">
                              <div className="metric-label">Risk Level</div>
                              <div className="metric-value">{item.category || 'N/A'}</div>
                              <button 
                                className="accordion-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const metricsContainer = e.target.closest('.growth-metrics');
                                  metricsContainer.classList.toggle('expanded');
                                }}
                              >
                                ▼
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
                              <div className={`trend-indicator ${item.comp_irregularity?.includes('above') ? 'trend-indicator--high' : 'trend-indicator--low'}`}>
                                {item.comp_irregularity?.includes('above') ? (
                                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                                    <path d="M1 11L4 8L8 9L15 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M11 1H15V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                ) : (
                                  <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
                                    <path d="M15 1L12 4L8 3L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M5 11H1V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
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
                          <div className="growth-metrics">
                            <div className="metric-row metric-row--header">
                              <div className="metric-label">Average Salary</div>
                              <div className="metric-value">{item.average_salary || 'N/A'}</div>
                              <button 
                                className="accordion-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const metricsContainer = e.target.closest('.growth-metrics');
                                  metricsContainer.classList.toggle('expanded');
                                }}
                              >
                                ▼
                              </button>
                            </div>
                            <div className="metric-accordion">
                              <div className="metric-row">
                                <div className="metric-label">Category</div>
                                <div className="metric-value">{item.category || 'N/A'}</div>
                              </div>
                              <div className="metric-row">
                                <div className="metric-label">Cost Savings</div>
                                <div className="metric-value">70-80%</div>
                              </div>
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
                )}
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
